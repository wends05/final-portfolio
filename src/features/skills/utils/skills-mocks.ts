import { MOCK_INDEX_PROJECTS } from "#/features/projects/utils/project-mocks";
import type {
	LandingSkillCategory,
	SkillCategoryPageData,
} from "#/features/skills/skills.types";

type MockInput = Pick<
	LandingSkillCategory,
	"id" | "slug" | "name" | "topRank" | "skills"
> &
	Partial<LandingSkillCategory>;

const mockCategory = (category: MockInput): LandingSkillCategory => ({
	overview: `What ${category.name.toLowerCase()} means in my work: the tools I reach for first, the projects where they did the work, and what I am learning next.`,
	confidence: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	...category,
});

let skillIndex = 0;
// Skill names are unique ignoring case, so no name repeats across categories.
const skills = (...names: string[]) =>
	names.map((name) => ({
		id: `00000000-0000-4000-8000-0000000002${String(++skillIndex).padStart(2, "0")}`,
		name,
	}));

// Hardcoded while the /skills page is built. The top three come first in
// topRank order; the rest have no rank and no guaranteed order, like the query.
export const MOCK_SKILL_CATEGORIES: LandingSkillCategory[] = [
	mockCategory({
		id: "00000000-0000-4000-8000-0000000000a1",
		slug: "web-development",
		name: "Web development",
		topRank: 1,
		confidence: 80,
		skills: skills(
			"Next.js",
			"React",
			"Tailwind CSS",
			"Prisma",
			"React Query",
			"TypeScript",
			"TanStack Start",
			"PostgreSQL",
		),
	}),
	mockCategory({
		id: "00000000-0000-4000-8000-0000000000a2",
		slug: "mobile-development",
		name: "Mobile development",
		topRank: 2,
		confidence: 55,
		skills: skills("Flutter", "React Native", "Expo"),
	}),
	mockCategory({
		id: "00000000-0000-4000-8000-0000000000a3",
		slug: "game-development",
		name: "Game development",
		topRank: 3,
		confidence: 60,
		skills: skills("Godot"),
	}),
	mockCategory({
		id: "00000000-0000-4000-8000-0000000000a4",
		slug: "backend-development",
		name: "Backend development",
		topRank: null,
		confidence: 70,
		skills: skills("Go", "Node.js", "Express", "Redis"),
	}),
	mockCategory({
		id: "00000000-0000-4000-8000-0000000000a5",
		slug: "ui-design",
		name: "UI design",
		topRank: null,
		// No confidence: the page hides it.
		confidence: null,
		skills: skills("Figma", "Framer"),
	}),
	mockCategory({
		id: "00000000-0000-4000-8000-0000000000a6",
		slug: "devops",
		name: "DevOps",
		topRank: null,
		confidence: 40,
		skills: skills("Docker"),
	}),
	mockCategory({
		id: "00000000-0000-4000-8000-0000000000a7",
		slug: "machine-learning",
		name: "Machine learning",
		topRank: null,
		confidence: null,
		skills: skills("Python", "PyTorch", "scikit-learn"),
	}),
];

/**
 * The /skills/<slug> page for a mock category, or null for an unknown slug.
 * Its projects are the mock /projects entries that used any of the category's
 * skills, matched by name, each keeping only those skills.
 */
export function getMockSkillCategoryPage(
	slug: string,
): SkillCategoryPageData | null {
	const category = MOCK_SKILL_CATEGORIES.find((c) => c.slug === slug);
	if (!category) return null;

	const projects = MOCK_INDEX_PROJECTS.flatMap((project) => {
		const used = new Set(project.skills.map((s) => s.name.toLowerCase()));
		const skills = category.skills.filter((s) =>
			used.has(s.name.toLowerCase()),
		);
		if (skills.length === 0) return [];
		return [
			{ id: project.id, slug: project.slug, title: project.title, skills },
		];
	});

	const { id, name, overview, confidence, topRank } = category;
	return {
		id,
		slug,
		name,
		overview,
		confidence,
		topRank,
		skills: category.skills,
		projects,
	};
}
