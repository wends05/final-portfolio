import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { isSiteGated } from "./site.utils";

export const getSiteGate = createServerFn().handler(async () => ({
	gated: isSiteGated({
		comingSoon: process.env.COMING_SOON,
		previewToken: process.env.PREVIEW_TOKEN,
		previewCookie: getCookie("preview"),
	}),
}));
