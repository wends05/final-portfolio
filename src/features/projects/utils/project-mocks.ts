import type {
	FeaturedProject,
	ProjectPageData,
} from "#/features/projects/projects.types";
import { getProjectPosition } from "#/features/projects/projects.utils";

type MockInput = Pick<FeaturedProject, "slug" | "title" | "description"> &
	Partial<FeaturedProject>;

const mockProject = (project: MockInput, index: number): FeaturedProject => ({
	id: `00000000-0000-4000-8000-0000000001${String(index).padStart(2, "0")}`,
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
	tools: [],
	...project,
});

const tools = (...names: string[]) => names.map((name) => ({ name }));

// Stand-ins while the database has no published projects. The /projects
// routes fall back to them in development only, when the real list is empty.
// Listed in the /projects order (featured by rank, then newest first).
// Covers are null, so tiles show their placeholder.
const projects: MockInput[] = [
	{
		slug: "baconawa-and-eggs",
		title: "Baconawa and Eggs",
		description:
			"Game made for The Odyssey Festival (2024). Released Aug 2024. Under development for more gameplay features.",
		status: "ONGOING",
		featuredRank: 1,
		teamName: "team nyats",
		startedAt: "2024-09-01",
		createdAt: "2024-09-01T00:00:00.000Z",
		githubUrl: "https://github.com/wends05/Baconawa-and-Eggs",
		// The list form keeps this order on the page.
		metadata: [
			{ label: "event", value: "The Odyssey Festival 2024" },
			{ label: "role", value: "programmer" },
			{ label: "platforms", value: ["Windows", "Web"] },
			{ label: "category", value: "game development" },
		],
		tools: tools("Godot"),
	},
	{
		slug: "capycopy",
		title: "CapyCopy",
		description:
			"A web application based on my classmate's project for a certain subject. My first project using React and TypeScript together with Vite.",
		featuredRank: 2,
		startedAt: "2024-01-01",
		endedAt: "2024-02-15",
		createdAt: "2024-01-01T00:00:00.000Z",
		githubUrl: "https://github.com/wends05/capycopy",
		liveUrl: "https://wends05.github.io/capycopy/",
		metadata: {
			category: "web development",
			"based on": "a classmate's project for a subject",
		},
		tools: tools("React", "TypeScript", "Vite", "React Router"),
	},
	{
		slug: "jankenfun",
		title: "JankenFun (JS)",
		description:
			"A game for Robotopia Iloilo (2023). Written in vanilla JavaScript.",
		featuredRank: 3,
		startedAt: "2023-11-01",
		endedAt: "2023-11-20",
		createdAt: "2023-11-01T00:00:00.000Z",
		githubUrl: "https://github.com/wends05/jankenfun",
		tools: tools("JavaScript", "HTML", "CSS"),
	},
	{
		slug: "wends-dev",
		title: "wends.dev",
		description: "This portfolio.",
		status: "ONGOING",
		startedAt: "2026-10-01",
		createdAt: "2026-10-01T00:00:00.000Z",
		tools: tools("TanStack Start", "React", "Prisma", "Neon"),
	},
	{
		slug: "taskflow",
		title: "Taskflow",
		description:
			"A kanban board with real-time sync, keyboard-first navigation, and offline support.",
		startedAt: "2025-06-01",
		endedAt: "2025-08-30",
		createdAt: "2025-08-01T00:00:00.000Z",
		tools: tools("React", "TypeScript", "Convex"),
	},
	{
		slug: "pixel-garden",
		title: "Pixel Garden",
		description: "A cozy farming game made in a weekend game jam.",
		teamName: "team nyats",
		startedAt: "2025-05-01",
		endedAt: "2025-05-03",
		createdAt: "2025-05-01T00:00:00.000Z",
		tools: tools("Godot"),
	},
	{
		slug: "ledger-cli",
		title: "Ledger CLI",
		description:
			"A command line tool that tracks expenses in plain text files.",
		startedAt: "2025-01-10",
		endedAt: "2025-02-20",
		createdAt: "2025-02-01T00:00:00.000Z",
		tools: tools("Go"),
	},
	{
		slug: "robotopia-scoreboard",
		title: "Robotopia Scoreboard",
		description: "A live scoreboard for a robotics competition.",
		startedAt: "2024-11-01",
		endedAt: "2024-11-10",
		createdAt: "2024-11-01T00:00:00.000Z",
		tools: tools("Svelte", "TypeScript"),
	},
	{
		slug: "notes-sync",
		title: "Notes Sync",
		description: "Markdown notes that sync across devices.",
		startedAt: "2024-06-01",
		endedAt: "2024-07-15",
		createdAt: "2024-07-01T00:00:00.000Z",
		tools: tools("Next.js", "Supabase"),
	},
	{
		slug: "se-web-app",
		title: "Software Engineering Web App",
		description: "Official Software Engineering Department web application.",
		teamName: "SE 2024 – 2025",
		startedAt: "2024-01-15",
		endedAt: "2024-05-30",
		createdAt: "2024-01-15T00:00:00.000Z",
		tools: tools("Next.js", "Tailwind CSS", "Firebase", "React Query"),
	},
	{
		slug: "clicker-game",
		title: "Clicker Game",
		description:
			"A group project for university. My first project in game development, and in Godot.",
		startedAt: "2024-01-05",
		endedAt: "2024-01-25",
		createdAt: "2024-01-05T00:00:00.000Z",
		githubUrl: "https://github.com/wends05/clicker-game",
		tools: tools("Godot"),
	},
	{
		slug: "recipe-box",
		title: "Recipe Box",
		description: "Save recipes and plan the week's meals.",
		startedAt: "2023-10-01",
		endedAt: "2023-10-20",
		createdAt: "2023-10-01T00:00:00.000Z",
		tools: tools("Vue", "Firebase"),
	},
];

export const MOCK_INDEX_PROJECTS: FeaturedProject[] = projects.map(mockProject);

// A flat 4:3 frame with its label, standing in for a screenshot.
const placeholderShot = (label: string) =>
	`data:image/svg+xml,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e4e2dc"/><text x="16" y="284" font-family="monospace" font-size="12" fill="#6d696a">${label}</text></svg>`,
	)}`;

/** A case-study page for a mock project, or null for an unknown slug. */
export function getMockProjectPage(slug: string): ProjectPageData | null {
	const project = MOCK_INDEX_PROJECTS.find((p) => p.slug === slug);
	const place = getProjectPosition(MOCK_INDEX_PROJECTS, slug);
	if (!project || !place) return null;
	return {
		project,
		// Featured mocks get a four-image gallery, so the carousel controls show.
		gallery:
			project.featuredRank != null
				? [1, 2, 3, 4].map((n) => ({
						url: placeholderShot(`gallery ${n} — ${slug}`),
						alt: `Gallery image ${n} of ${project.title}`,
					}))
				: [],
		// Team projects credit placeholder collaborators, one without a profile.
		credits: project.teamName
			? [
					{
						name: "[collaborator 1]",
						role: "art",
						profileUrl: "https://example.com",
					},
					{ name: "[collaborator 2]", role: "music", profileUrl: null },
				]
			: [],
		...place,
	};
}
