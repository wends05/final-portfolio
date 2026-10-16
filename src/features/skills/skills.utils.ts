/**
 * The first `count` skills to list by name, and how many are left over for
 * the "+N" after them.
 */
export function splitVisibleSkills<T>(skills: T[], count: number) {
	const visible = skills.slice(0, Math.max(count, 0));
	return { visible, hidden: skills.length - visible.length };
}

/**
 * The projects that used the skill with `skillId`, or all of them when no
 * skill is selected.
 */
export function filterProjectsBySkill<T extends { skills: { id: string }[] }>(
	projects: T[],
	skillId: string | null,
) {
	if (skillId === null) return projects;
	return projects.filter((project) =>
		project.skills.some((skill) => skill.id === skillId),
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
