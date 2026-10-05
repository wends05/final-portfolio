interface SiteGateInput {
	comingSoon: string | undefined;
	previewToken: string | undefined;
	previewCookie: string | undefined;
}

/** True when public pages should redirect to /coming-soon. */
export function isSiteGated({
	comingSoon,
	previewToken,
	previewCookie,
}: SiteGateInput) {
	const hasPreview = !!previewToken && previewCookie === previewToken;
	return comingSoon === "true" && !hasPreview;
}
