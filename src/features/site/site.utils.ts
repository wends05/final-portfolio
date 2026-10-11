/** True when public pages should redirect to /coming-soon. */
export function isSiteGated(comingSoon: string | undefined) {
	return comingSoon === "true";
}
