import { createServerFn } from "@tanstack/react-start";
import { getHomepageData } from "./public.server";

export const getHomepageFn = createServerFn().handler(() => getHomepageData());
