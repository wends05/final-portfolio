# Content

How the site's content is stored, validated, and read. The rationale is in [decision 0019](decisions/0019-static-site-content-in-repo.md); the vocabulary (project, case study, draft, featured project, skill, tool, collaborator, credit) is defined in [../CONTEXT.md](../CONTEXT.md).

Content is files in `content/`, edited by pull request. [Velite](https://velite.js.org) validates the files and generates typed data at build time. There is no database.

## Files

```
content/
  site.yaml                  # homepage order
  tools.yaml                 # every tool name
  collaborators.yaml         # people credited on projects
  projects/<slug>/index.md   # one project: frontmatter + case-study write-up, images beside it
  skills/<slug>.md           # one skill: frontmatter + overview
```

| File | Fields | Rules |
| --- | --- | --- |
| `projects/<slug>/index.md` | `slug`, `title`, `description`, `status`, `startedAt`, `endedAt?`, `cover?`, `gallery?`, `tools`, `credits?`, `teamName?`, `githubUrl?`, `liveUrl?`, `metadata?`, `draft?`; body | `slug` unique and kebab-case, matching the folder name. `status` is `ONGOING` or `COMPLETED`. Dates are `YYYY-MM-DD`; `endedAt` is not before `startedAt`, and is empty while ongoing. `description` is the short summary; the body is the case-study write-up. |
| `skills/<slug>.md` | `slug`, `name`, `confidence`, `tools`, `draft?`; body | The body is the overview; its first 160 characters as plain text are the page description. `confidence` is required, an integer from 0 to 100. |
| `tools.yaml` | A list of names | Unique ignoring case, so "React" and "react" cannot both exist. A tool can belong to several skills or to none. |
| `collaborators.yaml` | `slug`, `name`, `profileUrl?` | `slug` unique. Collaborators do not sign in. |
| `site.yaml` | `featured`, `topSkills` | Ordered slug lists. Position in the list is the homepage order. |

A project's frontmatter, with every field:

```md
---
slug: baconawa-and-eggs
title: Baconawa and Eggs
description: Game made for The Odyssey Festival (2024).
status: ONGOING
startedAt: 2024-09-01
endedAt:
cover: ./cover.png
gallery:
  - { image: ./shot-1.png, alt: "Title screen with the bacon character" }
tools: [Godot]
teamName: team nyats
credits:
  - { collaborator: jane-doe, role: Artist }
githubUrl: https://github.com/wends05/Baconawa-and-Eggs
liveUrl:
metadata:
  - { label: event, value: The Odyssey Festival 2024 }
  - { label: platforms, value: [Windows, Web] }
draft: false
---
## Problem
…
```

## Rules

- **References are by name or slug.** Projects and skills list tools by name, matched ignoring case against `tools.yaml`. Credits reference collaborators by slug. `site.yaml` references projects and skills by slug.
- **Order is manual.** `featured` and `topSkills` order the homepage. Other projects list newest first by `startedAt`; the `/projects` order is featured projects first, then the rest.
- **The case-study body is text.** Headings, paragraphs, lists, links, and emphasis. Images go in `gallery`, not in the body.
- **`metadata` is for facts that have not earned a field.** A list of `label`/`value` pairs, shown in order on the case study. Values are text, numbers, booleans, or lists of those.

## Drafts

`draft: true` marks a project or skill that is not ready. Drafts are removed from the generated data unless `VITE_SHOW_DRAFTS=true`, so they never reach a production bundle, even inside JavaScript. Their cover and gallery images are not copied to `public/static` either, unless a published project uses the same file. A draft listed in `featured` or `topSkills` is skipped, and the next one takes its place.

Feature branches do not deploy ([0014](decisions/0014-vercel-deploys-main-and-development-only.md)). Preview a draft locally with `VITE_SHOW_DRAFTS=true` in `.env.local`, or on `development` with the variable scoped to Vercel's Preview environment. Never set it for Vercel's Production environment: there it would publish every draft and its images.

## Images

- Store images beside the content that uses them, such as `content/projects/<slug>/cover.png`, and reference them by relative path.
- Velite copies each image to `public/static/` with a hashed name and returns its URL, width, height, and a blur placeholder.
- Export images at web size: the schema rejects images wider than 2400px. Every gallery image needs `alt`.
- Velite's URLs are relative (`/static/…`). Make them absolute for Open Graph tags.

## Validation

| Where | Checks |
| --- | --- |
| Velite schema (per file) | Required fields, formats (slug, dates, URLs), `confidence` bounds, image width, `alt`, `endedAt` not before `startedAt` |
| Velite `prepare` hook (across files) | Unique slugs, unknown tools or collaborators, unknown slugs in `site.yaml`, duplicate tool names ignoring case |
| Vitest | The pure functions that shape the data for pages |

Both Velite checks fail `vite build`, so invalid content fails the Vercel deployment as well as `verify`. A page that fails to prerender does not fail the build on its own, so a post-build check confirms the expected pages exist ([decision 0019](decisions/0019-static-site-content-in-repo.md#build-and-serving)).

## Generated output

Velite writes `.velite/` (JSON, `index.js`, and types) and `public/static/` (image copies). Both are gitignored and rebuilt by `dev`, `build`, `postinstall`, and `verify`. Import the data through `#content`; never edit the output by hand.

## Adding content

Run `bun run new:project <slug>` to scaffold a project, then follow the "adding content" recipe in [../AGENTS.md](../AGENTS.md). The resume is a static `public/resume.pdf`, replaced by commit.
