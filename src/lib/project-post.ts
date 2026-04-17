import type { Project } from "@/components/site/ProjectCard";
import { projectSlug } from "@/lib/projects";

// Build the Tiptap JSON body seeded for a project-linked blog post.
// Mirrors what the /projects/[id] detail page used to render: overview,
// stack, links. Kept deliberately terse so it's a starting point the
// admin can expand in the editor.
function buildProjectPostContent(project: Project) {
  const content: Array<Record<string, unknown>> = [];

  content.push(
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Overview" }] },
    { type: "paragraph", content: [{ type: "text", text: project.description }] },
  );

  if (project.stack.length > 0) {
    content.push(
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Stack" }] },
      {
        type: "bulletList",
        content: project.stack.map((tech) => ({
          type: "listItem",
          content: [
            { type: "paragraph", content: [{ type: "text", text: tech }] },
          ],
        })),
      },
    );
  }

  const linkItems: Array<Record<string, unknown>> = [];
  if (project.demo_url) {
    linkItems.push({
      type: "listItem",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Live demo: " },
            {
              type: "text",
              text: project.demo_url,
              marks: [{ type: "link", attrs: { href: project.demo_url, target: "_blank" } }],
            },
          ],
        },
      ],
    });
  }
  if (project.github_url) {
    linkItems.push({
      type: "listItem",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Source: " },
            {
              type: "text",
              text: project.github_url,
              marks: [{ type: "link", attrs: { href: project.github_url, target: "_blank" } }],
            },
          ],
        },
      ],
    });
  }
  if (linkItems.length) {
    content.push(
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Links" }] },
      { type: "bulletList", content: linkItems },
    );
  }

  return { type: "doc", content };
}

// Payload we insert/upsert into `posts` when the admin creates a project.
// show_on_writing defaults to false so project blogs stay out of /writing
// and the home writing rail.
export function buildProjectPostPayload(
  project: Project,
  opts: { preservePublishedAt?: string | null } = {}
) {
  return {
    project_id: project.id,
    title: project.name,
    slug: projectSlug(project),
    content: buildProjectPostContent(project),
    excerpt: project.description,
    cover_image_url: project.image_url ?? null,
    is_published: true,
    published_at: opts.preservePublishedAt ?? new Date().toISOString(),
    show_on_writing: false,
  };
}
