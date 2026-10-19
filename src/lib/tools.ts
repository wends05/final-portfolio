/**
 * The first `count` tools to list by name, and how many are left over for
 * the "+N" after them. Shared by the skills list and the projects preview.
 */
export function splitVisibleTools<T>(tools: T[], count: number) {
	const visible = tools.slice(0, Math.max(count, 0));
	return { visible, hidden: tools.length - visible.length };
}
