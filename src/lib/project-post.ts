import type { Project } from "@/components/site/ProjectCard";
import { projectSlug } from "@/lib/projects";

// Metadata stub created when a project is added via the admin. The
// /blog/<slug> page renders the case-file layout directly from project
// fields, so the post row just exists to carry the slug + visibility
// flags — its content field is unused. Published by default (content
// always renders from project data) and hidden from /writing.
export function buildProjectPostPayload(project: Project) {
  return {
    project_id: project.id,
    title: project.name,
    slug: projectSlug(project),
    content: null,
    excerpt: null,
    cover_image_url: project.image_url ?? null,
    is_published: true,
    published_at: new Date().toISOString(),
    show_on_writing: false,
  };
}

// Kept for the one-off backfill script. Used to pre-populate project
// posts that existed before the auto-create flow landed. NOT used by
// the admin form or sync button — those create empty stubs so the
// admin can write from scratch.
export function buildProjectPostSeedContent(project: Project) {
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
