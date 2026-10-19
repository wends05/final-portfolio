// Pure helpers for `bun run new:project`, kept apart from the script so
// Vitest can test them without touching the file system.

/** Kebab-case, 3 to 200 characters: Velite's slug rule, lowercase only. */
export function isProjectSlug(slug: string): boolean {
	return (
		slug.length >= 3 &&
		slug.length <= 200 &&
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
	);
}

/** "baconawa-and-eggs" → "Baconawa And Eggs", a first guess to edit. */
export function titleFromSlug(slug: string): string {
	return slug
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/** A local calendar date as YYYY-MM-DD, the format content dates use. */
export function toDateString(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * A new project's index.md: the required fields filled in, the optional ones
 * commented out, `draft: true` so it stays off the live site until it is
 * ready, and the write-up headings. Fields are described in docs/data.md.
 */
export function projectTemplate(slug: string, today: string): string {
	return `---
slug: ${slug}
title: ${JSON.stringify(titleFromSlug(slug))}
description: "TODO: one or two sentences for lists and link previews."
status: ONGOING
startedAt: ${today}
# endedAt: YYYY-MM-DD      # empty while ongoing
# cover: ./cover.png       # beside this file, at most 2400px wide
# gallery:
#   - { image: ./shot-1.png, alt: "What the image shows" }
tools: []                  # names from content/tools.yaml
# teamName: ""
# credits:
#   - { collaborator: jane-doe, role: Artist }   # slugs from content/collaborators.yaml
# githubUrl: https://github.com/…
# liveUrl: https://…
# metadata:
#   - { label: event, value: "…" }
draft: true                # set to false (or remove) to publish
---
## Problem

## Approach

## Result
`;
}
