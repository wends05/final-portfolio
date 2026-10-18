// Checks across content files, run by Velite's `prepare` hook. Per-file rules
// live in the schemas in velite.config.ts. This module must not import
// `#content`: it runs while that output is being generated.

interface ProjectEntry {
	slug: string;
	path: string;
	tools: string[];
	credits: { collaborator: string }[];
	draft: boolean;
}

interface SkillEntry {
	slug: string;
	path: string;
	tools: string[];
	draft: boolean;
}

export interface ContentData {
	projects: ProjectEntry[];
	skills: SkillEntry[];
	tools: string[];
	collaborators: { slug: string }[];
	site: { featured: string[]; topSkills: string[] };
}

/** Tool names match ignoring case, so "React" and "react" are the same tool. */
export const toolKey = (name: string) => name.toLowerCase();

/** Every broken cross-file rule, one message each; empty when the content is valid. */
export function findContentErrors(data: ContentData): string[] {
	const errors: string[] = [];

	const toolKeys = new Set<string>();
	for (const name of data.tools) {
		const key = toolKey(name);
		if (toolKeys.has(key)) {
			errors.push(`tools.yaml: "${name}" is listed more than once`);
		}
		toolKeys.add(key);
	}
	const checkTools = (where: string, names: string[]) => {
		for (const name of names) {
			if (!toolKeys.has(toolKey(name))) {
				errors.push(`${where}: unknown tool "${name}"`);
			}
		}
	};

	const collaboratorSlugs = new Set(data.collaborators.map((c) => c.slug));

	for (const project of data.projects) {
		if (project.path !== `projects/${project.slug}`) {
			errors.push(
				`${project.path}: slug "${project.slug}" does not match its folder`,
			);
		}
		checkTools(project.path, project.tools);
		for (const { collaborator } of project.credits) {
			if (!collaboratorSlugs.has(collaborator)) {
				errors.push(`${project.path}: unknown collaborator "${collaborator}"`);
			}
		}
	}

	for (const skill of data.skills) {
		if (skill.path !== `skills/${skill.slug}`) {
			errors.push(
				`${skill.path}: slug "${skill.slug}" does not match its file name`,
			);
		}
		checkTools(skill.path, skill.tools);
	}

	// Drafts count here: a featured draft is valid and only skipped later.
	const projectSlugs = new Set(data.projects.map((p) => p.slug));
	for (const slug of data.site.featured) {
		if (!projectSlugs.has(slug)) {
			errors.push(`site.yaml: unknown featured project "${slug}"`);
		}
	}
	const skillSlugs = new Set(data.skills.map((s) => s.slug));
	for (const slug of data.site.topSkills) {
		if (!skillSlugs.has(slug)) {
			errors.push(`site.yaml: unknown top skill "${slug}"`);
		}
	}

	return errors;
}

/**
 * Removes draft projects and skills in place, and their slugs from
 * `site.featured` and `site.topSkills`, so the next one takes a draft's place
 * and no draft slug reaches the bundle.
 */
export function removeDrafts(data: ContentData): void {
	const draftProjects = new Set(
		data.projects.filter((p) => p.draft).map((p) => p.slug),
	);
	const draftSkills = new Set(
		data.skills.filter((s) => s.draft).map((s) => s.slug),
	);
	// In place: Velite writes the arrays it passed to `prepare`.
	removeWhere(data.projects, (p) => draftProjects.has(p.slug));
	removeWhere(data.skills, (s) => draftSkills.has(s.slug));
	data.site.featured = data.site.featured.filter(
		(slug) => !draftProjects.has(slug),
	);
	data.site.topSkills = data.site.topSkills.filter(
		(slug) => !draftSkills.has(slug),
	);
}

function removeWhere<T>(items: T[], remove: (item: T) => boolean): void {
	const kept = items.filter((item) => !remove(item));
	items.splice(0, items.length, ...kept);
}
