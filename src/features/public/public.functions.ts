import { createServerFn } from "@tanstack/react-start";
import { getHomepageData } from "./public.server";

export const getHomepage = createServerFn().handler(() => getHomepageData());
