import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import ProjectsPage from "#/features/projects/components/ProjectsPage";
import type { Project } from "#content";

vi.mock("@tanstack/react-router", () => ({ useRouter: () => ({}) }));
vi.mock("#/features/public/hooks/usePageEntrance", () => ({
	usePageEntrance: () => {},
}));
vi.mock("#/features/public/hooks/usePickTransition", () => ({
	usePickTransition: () => {},
}));
vi.mock("#/features/projects/components/ProjectCard", () => ({
	default: () => null,
}));
vi.mock("#/features/projects/components/ProjectPreview", () => ({
	default: () => null,
}));

const project = { slug: "a", title: "A" } as Project;

const render = (projects: Project[]) =>
	renderToStaticMarkup(<ProjectsPage projects={projects} featured={[]} />);

describe("ProjectsPage", () => {
	// The navbar has no background, so on phones this bar keeps tiles from
	// showing through it above the sticky strip.
	it("fills the space behind the navbar on phones only", () => {
		const bar = render([project]).match(/<div[^>]*aria-hidden[^>]*>/)?.[0];
		expect(bar).toBeDefined();
		const classes = bar?.match(/class="([^"]+)"/)?.[1].split(" ");
		expect(classes).toEqual(
			expect.arrayContaining([
				"fixed",
				"top-0",
				"bg-background",
				"h-(--navbar-height)",
				"md:hidden",
			]),
		);
	});

	it("draws no bar when there are no projects", () => {
		expect(render([])).not.toContain("aria-hidden");
	});
});
