import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getAllProjects, getProjectPage } from "./projects.server";

/** A published project's case study by slug, or null when none matches. */
export const getProjectPageFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => getProjectPage(data.slug));

/** Every published project, in the /projects order. */
export const getProjectsPageFn = createServerFn().handler(() =>
	getAllProjects(),
);
