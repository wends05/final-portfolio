import { createServerFn } from "@tanstack/react-start";
import { isSiteGated } from "./site.utils";

export const getSiteGate = createServerFn().handler(async () => ({
	gated: isSiteGated(process.env.COMING_SOON),
}));
