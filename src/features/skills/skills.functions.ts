import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getAllSkills, getSkillPage } from "./skills.server";

export const getSkillsPageFn = createServerFn().handler(getAllSkills);

/** A skill's page by slug, or null when none matches. */
export const getSkillPageFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => getSkillPage(data.slug));
