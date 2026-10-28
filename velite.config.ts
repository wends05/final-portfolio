import { assets, defineCollection, defineConfig, s } from "velite";
import {
	draftOnlyImages,
	findContentErrors,
	removeDrafts,
} from "./src/lib/content.checks";

// Images are exported at web size (docs/data.md#images).
const MAX_IMAGE_WIDTH = 2400;

const image = s
	.image()
	.refine(
		(img) => img.width <= MAX_IMAGE_WIDTH,
		`Images must be at most ${MAX_IMAGE_WIDTH}px wide`,
	);

// A calendar date, kept as "YYYY-MM-DD": the site shows days and months only,
// and a date without a time reads the same in every timezone. The round trip
// rejects dates that don't exist, such as 2024-02-30.
const date = s
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, "Dates are YYYY-MM-DD")
	// Zod still runs this after a failed regex, so it must not throw.
	.refine((value) => {
		const parsed = new Date(value);
		return (
			!Number.isNaN(parsed.getTime()) &&
			parsed.toISOString().slice(0, 10) === value
		);
	}, "Not a real date");

// Links render as `href`, so only web URLs pass (not `javascript:` or `mailto:`).
// An empty YAML value (`endedAt:`) parses as null, so optional fields accept it.
const url = s
	.string()
	.url()
	.refine((value) => /^https?:\/\//.test(value), "Use an http or https URL")
	.nullish();

// `metadata` values are text, numbers, booleans, or lists of those.
const metadataScalar = s.union([s.string(), s.number(), s.boolean()]);

const projects = defineCollection({
	name: "Project",
	pattern: "projects/*/index.md",
	schema: s
		.object({
			slug: s.slug("projects"),
			// "projects/<folder>", for the slug-matches-folder check in prepare.
			path: s.path(),
			title: s.string().min(1),
			description: s.string().min(1),
			status: s.enum(["ONGOING", "COMPLETED"]),
			startedAt: date,
			endedAt: date.nullish(),
			cover: image.nullish(),
			gallery: s.array(s.object({ image, alt: s.string().min(1) })).default([]),
			tools: s.array(s.string()).default([]),
			teamName: s.string().nullish(),
			credits: s
				.array(
					s.object({ collaborator: s.string(), role: s.string().nullish() }),
				)
				.default([]),
			githubUrl: url,
			liveUrl: url,
			metadata: s
				.array(
					s.object({
						label: s.string().min(1),
						value: s.union([metadataScalar, s.array(metadataScalar)]),
					}),
				)
				.default([]),
			draft: s.boolean().default(false),
			// The Markdown body: the case-study write-up, as HTML.
			body: s.markdown(),
			// The same write-up as Markdown, for the agent copy (ADR 0021).
			bodyMarkdown: s.raw(),
		})
		// YYYY-MM-DD strings compare in date order.
		.refine((p) => !p.endedAt || p.endedAt >= p.startedAt, {
			message: "endedAt is before startedAt",
			path: ["endedAt"],
		}),
});

const skills = defineCollection({
	name: "Skill",
	pattern: "skills/*.md",
	schema: s.object({
		slug: s.slug("skills"),
		// "skills/<file>", for the slug-matches-file check in prepare.
		path: s.path(),
		name: s.string().min(1),
		confidence: s.number().int().min(0).max(100),
		tools: s.array(s.string()).default([]),
		draft: s.boolean().default(false),
		// The Markdown body: the overview, as HTML.
		overview: s.markdown(),
		// The same overview as Markdown, for the agent copy (ADR 0021).
		overviewMarkdown: s.raw(),
		// The overview as plain text, for the page's meta description.
		description: s.excerpt({ length: 160 }),
	}),
});

const tools = defineCollection({
	name: "Tool",
	// A YAML list: each item becomes one entry.
	pattern: "tools.yaml",
	schema: s.string().min(1),
});

const collaborators = defineCollection({
	name: "Collaborator",
	pattern: "collaborators.yaml",
	schema: s.object({
		slug: s.slug("collaborators"),
		name: s.string().min(1),
		profileUrl: url,
	}),
});

const site = defineCollection({
	name: "Site",
	pattern: "site.yaml",
	single: true,
	schema: s.object({
		featured: s.array(s.string()).default([]),
		topSkills: s.array(s.string()).default([]),
	}),
});

export default defineConfig({
	root: "content",
	// Without it, an invalid file is logged, dropped, and the build exits 0.
	// The `velite` CLI defaults `--strict` to false, which overrides this, so
	// scripts pass `--strict` themselves.
	strict: true,
	output: {
		data: ".velite",
		assets: "public/static",
		base: "/static/",
		name: "[name]-[hash:6].[ext]",
		clean: true,
	},
	collections: { projects, skills, tools, collaborators, site },
	prepare(data) {
		// Featured slugs are checked before drafts go, so a featured draft is valid.
		const errors = findContentErrors(data);
		if (errors.length > 0) {
			throw new Error(`Invalid content:\n- ${errors.join("\n- ")}`);
		}
		if (process.env.VITE_SHOW_DRAFTS === "true") return;
		// Drafts never reach the generated data, so not the bundle either.
		const removed = removeDrafts(data);
		// Velite copies images to public/static after this hook, from its asset
		// list keyed by file name. Dropping a draft's images there keeps them
		// off the deployed site too.
		for (const name of draftOnlyImages(removed.projects, data.projects)) {
			assets.delete(name);
		}
	},
});
