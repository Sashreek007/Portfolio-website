/**
 * One-off: insert (or update) a sample blog post sourced from the
 * Claude Design handoff bundle (blog-website/project/posts.js, the
 * `kv-cache-fragmentation` post). Gives us a real reference for what
 * the editor output should look like once it gets reworked.
 *
 * Run: `npx tsx scripts/seed-sample-blog.ts`
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

// Minimal inline-mark helpers — produce Tiptap text nodes.
type TextNode = { type: "text"; text: string; marks?: Array<{ type: string }> };
const t = (text: string): TextNode => ({ type: "text", text });
const code = (text: string): TextNode => ({
  type: "text",
  text,
  marks: [{ type: "code" }],
});
const em = (text: string): TextNode => ({
  type: "text",
  text,
  marks: [{ type: "italic" }],
});
const strong = (text: string): TextNode => ({
  type: "text",
  text,
  marks: [{ type: "bold" }],
});

const p = (content: TextNode[]) => ({ type: "paragraph", content });
const h = (level: 2 | 3, text: string) => ({
  type: "heading",
  attrs: { level },
  content: [t(text)],
});
const pre = (language: string, text: string) => ({
  type: "codeBlock",
  attrs: { language },
  content: [t(text)],
});
const bq = (nodes: Array<ReturnType<typeof p>>) => ({
  type: "blockquote",
  content: nodes,
});
const ul = (items: TextNode[][]) => ({
  type: "bulletList",
  content: items.map((content) => ({
    type: "listItem",
    content: [p(content)],
  })),
});
const img = (src: string, alt: string) => ({
  type: "image",
  attrs: { src, alt },
});

const doc = {
  type: "doc",
  content: [
    p([
      t("i spent a weekend trying to fit a 7B model into a 24GB 4090 with a reasonable batch size. the model loaded. the context window was nominally 8k. and yet at batch=12 my allocator started returning "),
      code("CUDA out of memory"),
      t(" with what the profiler insisted was 3.4GB still free."),
    ]),
    p([
      t("this is a post about why that happens, and why the fix you find first — paged attention — is only half the story."),
    ]),

    h(2, "the obvious problem"),
    p([
      t("the kv-cache is the tensor you write your attention keys and values into while decoding. for a 7B model with 32 layers, 32 heads, head-dim 128, in fp16, the cache for a single token across all layers costs you:"),
    ]),
    pre(
      "python",
      "# file: kv_math.py\n# one token, across the whole stack\nbytes_per_token = (\n    2                # k + v\n    * num_layers     # 32\n    * num_heads      # 32\n    * head_dim       # 128\n    * dtype_bytes    # fp16 -> 2\n)\nassert bytes_per_token == 524_288     # 512 KB / token\n\n# a fleet of 64 concurrent users, each holding 8k of context:\nfootprint = 64 * 8_192 * bytes_per_token\nprint(f\"{footprint / 1e9:.1f} GB just for kv\")\n# -> 274.9 GB just for kv"
    ),
    p([
      t("512KB per token sounds fine until you remember you are serving "),
      em("many requests"),
      t(" at once, each with "),
      em("different lengths"),
      t(". if you pre-allocate max-length buffers for every slot in your batch, you get beautiful memory layout and about 12% utilization. if you pack them dynamically, you get fragmentation."),
    ]),
    img(
      "https://picsum.photos/seed/blog-kv-layout/1400/700",
      "naive contiguous layout: each row is one request, shaded cells are live tokens, grey cells are wasted pre-allocation. utilization hovers near 12%.",
    ),

    h(2, "why paged-attention works"),
    p([
      t("the vLLM paper's insight is basically the one from operating systems: stop pretending memory is contiguous. allocate in fixed-size "),
      strong("blocks"),
      t(" (typically 16 tokens), keep a page table mapping logical positions to physical blocks, and let the attention kernel chase pointers. fragmentation drops to within-block waste, which is bounded."),
    ]),
    bq([
      p([
        t("the right mental model is not \"i have a buffer per request.\" it is \"i have a pool of blocks, and every request is a linked list into it.\""),
      ]),
    ]),
    p([
      t("i implemented a toy version in triton and saw batch size jump from 12 to 38. that was the good news."),
    ]),
    img(
      "https://picsum.photos/seed/blog-paged-blocks/1400/700",
      "paged-attention: each request is a linked list of 16-token blocks into a shared pool. wasted memory is now bounded by the block size, not the request's max length.",
    ),

    h(2, "the less obvious problem"),
    p([
      t("after a few hours of real traffic my toy server started slowing down. throughput sagged. profiling showed the forward pass itself was fine — it was the "),
      em("allocator"),
      t(" spending measurable wall-clock time hunting for free blocks as the pool grew fragmented at the block level."),
    ]),
    bq([
      p([
        strong("the trap"),
        t("paged-attention eliminates "),
        em("intra-sequence"),
        t(" fragmentation. it does not eliminate "),
        em("inter-sequence"),
        t(" fragmentation of the block pool itself. with long-tailed request lengths and concurrent add/remove, your free-list eventually looks like swiss cheese."),
      ]),
    ]),

    h(3, "what actually fixes it"),
    ul([
      [
        t("keep a per-size free-list if your block sizes vary (they shouldn't, but people add \"micro-blocks\" for short prompts — don't)"),
      ],
      [
        t("batch block reclaim at request-completion boundaries rather than greedily on every "),
        code("eos"),
      ],
      [
        t("pre-warm the pool by allocating once at startup and never freeing back to the CUDA allocator — hold the whole arena yourself"),
      ],
    ]),
    p([
      t("the third one is the big one. once i stopped handing blocks back to "),
      code("cudaFree"),
      t(" and just managed a fixed arena, allocator latency went to zero and tail latency on decoding stabilized. you give up a little flexibility for a lot of predictability. on a serving box, that is always the right trade."),
    ]),
    pre(
      "python",
      "# file: arena.py\nclass BlockArena:\n    \"\"\"fixed-size pool of kv-cache blocks — never returns to cudaFree.\"\"\"\n\n    def __init__(self, n_blocks: int, block_bytes: int, device: str):\n        self.buf = torch.empty(\n            n_blocks * block_bytes, dtype=torch.uint8, device=device\n        )\n        self.free: deque[int] = deque(range(n_blocks))\n        self.block_bytes = block_bytes\n\n    def alloc(self) -> int:\n        if not self.free:\n            raise OutOfBlocks(\"arena exhausted — raise n_blocks\")\n        return self.free.popleft()\n\n    def release(self, block_id: int) -> None:\n        self.free.append(block_id)       # never free the tensor itself\n"
    ),
    p([
      t("the arena never hands memory back to the driver, so the allocator path becomes a constant-time deque pop. the tradeoff: you pick "),
      code("n_blocks"),
      t(" at startup and live with it. for inference servers, that ceiling is known — your gpu either has the room for the configuration or it doesn't."),
    ]),

    h(2, "the meta-point"),
    p([
      t("most of the \"ml infra\" i end up writing is not really about ml. it is about the fact that GPUs are small, memory is small, and the arrival process of requests is adversarial to your nice clean tensor layout. the transformer is a fixed piece of arithmetic. the serving stack is where the interesting engineering lives — and it's mostly "),
      em("1970s ideas"),
      t(" (paging, arenas, bin-packing) wearing new clothes."),
    ]),
    p([
      t("next post in this series: how to actually benchmark a serving stack so you don't fool yourself with a 99th-percentile number taken over 200 requests."),
    ]),
  ],
};

async function main() {
  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing supabase env vars");

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const slug = "serving-7b-on-one-gpu";
  const payload = {
    title:
      "serving __7B__ on one gpu — what nobody tells you about kv-cache fragmentation",
    slug,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: doc as any,
    excerpt:
      "paged-attention fixes the obvious fragmentation. it does not fix the less obvious one.",
    cover_image_url: null,
    is_published: true,
    // Noon UTC so the date lands on apr 12 in every North American tz.
    published_at: new Date("2026-04-12T12:00:00Z").toISOString(),
    show_on_writing: true,
    project_id: null,
    tags: [
      "ml-infra",
      "systems",
      "gpu",
      "series:serving-from-scratch",
      "part:3",
    ],
  };

  const { data: existing } = await supabase
    .from("posts")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`updated /blog/${slug}`);
  } else {
    const { error } = await supabase.from("posts").insert(payload);
    if (error) throw error;
    console.log(`inserted /blog/${slug}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
