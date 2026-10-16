/**
 * The first `count` tools to list by name, and how many are left over for
 * the "+N" after them.
 */
export function splitVisibleTools<T>(tools: T[], count: number) {
	const visible = tools.slice(0, Math.max(count, 0));
	return { visible, hidden: tools.length - visible.length };
}

/**
 * The projects that used the tool with `toolId`, or all of them when no
 * tool is selected.
 */
export function filterProjectsByTool<T extends { tools: { id: string }[] }>(
	projects: T[],
	toolId: string | null,
) {
	if (toolId === null) return projects;
	return projects.filter((project) =>
		project.tools.some((tool) => tool.id === toolId),
	);
}

/**
 * The item a pick landed on, found by its `data-slug`, and the rest of the
 * list, which fades while the picked title washes.
 */
export function splitPicked<T extends { dataset: DOMStringMap }>(
	items: T[],
	slug: string,
) {
	const picked = items.find((item) => item.dataset.slug === slug);
	return { picked, rest: items.filter((item) => item !== picked) };
}
