import { MOCK_INDEX_PROJECTS } from "#/features/projects/utils/project-mocks";
import type {
	LandingSkill,
	SkillPageData,
} from "#/features/skills/skills.types";

type MockInput = Pick<
	LandingSkill,
	"id" | "slug" | "name" | "topRank" | "tools"
> &
	Partial<LandingSkill>;

const mockSkill = (skill: MockInput): LandingSkill => ({
	overview: `What ${skill.name.toLowerCase()} means in my work: the tools I reach for first, the projects where they did the work, and what I am learning next.`,
	confidence: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	...skill,
});

let toolIndex = 0;
// Tool names are unique ignoring case, so no name repeats across skills.
const tools = (...names: string[]) =>
	names.map((name) => ({
		id: `00000000-0000-4000-8000-0000000002${String(++toolIndex).padStart(2, "0")}`,
		name,
	}));

// Hardcoded while the /skills page is built. The top three come first in
// topRank order; the rest have no rank and no guaranteed order, like the query.
export const MOCK_SKILLS: LandingSkill[] = [
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a1",
		slug: "web-development",
		name: "Web development",
		topRank: 1,
		confidence: 80,
		tools: tools(
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
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a2",
		slug: "mobile-development",
		name: "Mobile development",
		topRank: 2,
		confidence: 55,
		tools: tools("Flutter", "React Native", "Expo"),
	}),
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a3",
		slug: "game-development",
		name: "Game development",
		topRank: 3,
		confidence: 60,
		tools: tools("Godot"),
	}),
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a4",
		slug: "backend-development",
		name: "Backend development",
		topRank: null,
		confidence: 70,
		tools: tools("Go", "Node.js", "Express", "Redis"),
	}),
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a5",
		slug: "ui-design",
		name: "UI design",
		topRank: null,
		// No confidence: the page hides it.
		confidence: null,
		tools: tools("Figma", "Framer"),
	}),
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a6",
		slug: "devops",
		name: "DevOps",
		topRank: null,
		confidence: 40,
		tools: tools("Docker"),
	}),
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a7",
		slug: "machine-learning",
		name: "Machine learning",
		topRank: null,
		confidence: null,
		tools: tools("Python", "PyTorch", "scikit-learn"),
	}),
];

/**
 * The /skills/<slug> page for a mock skill, or null for an unknown slug.
 * Its projects are the mock /projects entries that used any of the skill's
 * tools, matched by name, each keeping only those tools.
 */
export function getMockSkillPage(slug: string): SkillPageData | null {
	const skill = MOCK_SKILLS.find((c) => c.slug === slug);
	if (!skill) return null;

	const projects = MOCK_INDEX_PROJECTS.flatMap((project) => {
		const used = new Set(project.tools.map((s) => s.name.toLowerCase()));
		const tools = skill.tools.filter((s) => used.has(s.name.toLowerCase()));
		if (tools.length === 0) return [];
		return [
			{
				id: project.id,
				slug: project.slug,
				title: project.title,
				coverImageUrl: project.coverImageUrl ?? null,
				tools,
			},
		];
	});

	const { id, name, overview, confidence, topRank } = skill;
	return {
		id,
		slug,
		name,
		overview,
		confidence,
		topRank,
		tools: skill.tools,
		projects,
	};
}
