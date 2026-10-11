import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getProjectBySlug } from "./projects.server";

/** A published project by slug, or null when none matches. */
export const getProjectBySlugFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => (await getProjectBySlug(data.slug)) ?? null);
