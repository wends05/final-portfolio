import { createServerFn } from "@tanstack/react-start";
import { getAllSkillCategories } from "./skills.server";

export const getSkillsPageFn = createServerFn().handler(getAllSkillCategories);
