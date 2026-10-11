import type { FeaturedProject } from "#/features/projects/projects.types";
import type { LandingSkillCategory } from "#/features/skills/skills.types";

const mockProject = (
	project: Pick<FeaturedProject, "id" | "slug" | "title" | "description"> &
		Partial<FeaturedProject>,
): FeaturedProject => ({
	coverImageKey: null,
	coverImageUrl: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	endedAt: null,
	featuredRank: null,
	githubUrl: null,
	liveUrl: null,
	metadata: {},
	published: true,
	startedAt: null,
	status: "COMPLETED",
	teamName: null,
	updatedAt: "2026-01-01T00:00:00.000Z",
	skills: [],
	...project,
});

// Hardcoded while the project cards are built; render the `projects` prop after.
export const MOCK_PROJECTS: FeaturedProject[] = [
	mockProject({
		id: "00000000-0000-4000-8000-000000000001",
		slug: "taskflow",
		title: "Taskflow",
		description:
			"A kanban board with real-time sync, keyboard-first navigation, and offline support.",
		status: "ONGOING",
		featuredRank: 1,
		startedAt: "2026-03-01",
		githubUrl: "https://github.com/example/taskflow",
		liveUrl: "https://taskflow.example.com",
		skills: [{ name: "React" }, { name: "TypeScript" }, { name: "PostgreSQL" }],
	}),
	mockProject({
		id: "00000000-0000-4000-8000-000000000002",
		slug: "trailnotes",
		title: "Trailnotes",
		description:
			"A hiking journal that maps routes, logs conditions, and exports GPX files.",
		featuredRank: 2,
		startedAt: "2025-06-01",
		endedAt: "2025-11-15",
		githubUrl: "https://github.com/example/trailnotes",
		skills: [{ name: "Flutter" }, { name: "Firebase" }],
	}),
	mockProject({
		id: "00000000-0000-4000-8000-000000000003",
		slug: "scaffold-cli",
		title: "Scaffold CLI",
		description:
			"A command line tool that generates project boilerplate and wires up the config files.",
		featuredRank: 3,
		teamName: "Dev Tools Club",
		startedAt: "2024-09-01",
		endedAt: "2025-01-20",
		githubUrl: "https://github.com/example/scaffold-cli",
		skills: [{ name: "Go" }],
	}),
];

const mockSkill = (
	skill: Pick<
		LandingSkillCategory,
		"id" | "slug" | "name" | "overview" | "topRank" | "skills"
	> &
		Partial<LandingSkillCategory>,
): LandingSkillCategory => ({
	confidence: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	updatedAt: "2026-01-01T00:00:00.000Z",
	...skill,
});

// Hardcoded while the skill rows are built; read the `skills` prop after.
export const MOCK_SKILLS: LandingSkillCategory[] = [
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a1",
		slug: "web-development",
		name: "Web development",
		overview:
			"Web applications and sites is a common way to create software used for multiple purposes. It is a common topic in software engineering.",
		topRank: 1,
		confidence: 80,
		skills: [
			{ id: "00000000-0000-4000-8000-0000000000b1", name: "Next.js" },
			{ id: "00000000-0000-4000-8000-0000000000b2", name: "React" },
			{ id: "00000000-0000-4000-8000-0000000000b3", name: "Tailwind CSS" },
			{ id: "00000000-0000-4000-8000-0000000000b4", name: "Prisma" },
			{ id: "00000000-0000-4000-8000-0000000000b5", name: "React Query" },
		],
	}),
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a2",
		slug: "mobile-development",
		name: "Mobile development",
		overview:
			"Some of our projects required us to create software for a certain problem in society. Mobile applications were one of the options.",
		topRank: 2,
		confidence: 55,
		skills: [
			{ id: "00000000-0000-4000-8000-0000000000b6", name: "Flutter" },
			{ id: "00000000-0000-4000-8000-0000000000b7", name: "React Native" },
			{ id: "00000000-0000-4000-8000-0000000000b8", name: "Expo" },
		],
	}),
	mockSkill({
		id: "00000000-0000-4000-8000-0000000000a3",
		slug: "game-development",
		name: "Game development",
		overview:
			"Some of the hackathons we joined allowed us to experience making games. These have helped us understand the basics, proper workflow, and requirements in creating games.",
		topRank: 3,
		confidence: 60,
		skills: [{ id: "00000000-0000-4000-8000-0000000000b9", name: "Godot" }],
	}),
];
