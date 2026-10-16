import { createServerFn } from "@tanstack/react-start";
import { getAllSkills } from "./skills.server";

export const getSkillsPageFn = createServerFn().handler(getAllSkills);
