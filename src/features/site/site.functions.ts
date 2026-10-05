import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";

export const getSiteGate = createServerFn().handler(async () => {
	const comingSoon = process.env.COMING_SOON === "true";
	const token = process.env.PREVIEW_TOKEN;
	const hasPreview = !!token && getCookie("preview") === token;

	return {
		gated: comingSoon && !hasPreview,
	};
});
