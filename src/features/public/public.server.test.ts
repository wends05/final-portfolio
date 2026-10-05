import { beforeEach, describe, expect, it, vi } from "vitest";
import { getFeaturedProjects } from "#/features/projects/projects.server";
import { getTopSkills } from "#/features/skills/skills.server";
import { getHomepageData, HOMEPAGE_FEATURED_LIMIT } from "./public.server";

vi.mock("#/features/projects/projects.server", () => ({
	getFeaturedProjects: vi.fn(),
}));
vi.mock("#/features/skills/skills.server", () => ({
	getTopSkills: vi.fn(),
}));

type Projects = Awaited<ReturnType<typeof getFeaturedProjects>>;
type Skills = Awaited<ReturnType<typeof getTopSkills>>;

describe("getHomepageData", () => {
	beforeEach(() => {
		vi.mocked(getFeaturedProjects).mockReset();
		vi.mocked(getTopSkills).mockReset();
	});

	it("returns featured projects and top skills as plain data", async () => {
		const projects = [{ id: "p1", title: "Portfolio" }] as unknown as Projects;
		const skills = [{ id: "s1", name: "Web" }] as unknown as Skills;
		vi.mocked(getFeaturedProjects).mockResolvedValue(projects);
		vi.mocked(getTopSkills).mockResolvedValue(skills);

		await expect(getHomepageData()).resolves.toEqual({ projects, skills });
	});

	it("asks for three of each", async () => {
		vi.mocked(getFeaturedProjects).mockResolvedValue([] as unknown as Projects);
		vi.mocked(getTopSkills).mockResolvedValue([] as unknown as Skills);

		await getHomepageData();

		expect(HOMEPAGE_FEATURED_LIMIT).toBe(3);
		expect(getFeaturedProjects).toHaveBeenCalledWith({ limit: 3 });
		expect(getTopSkills).toHaveBeenCalledWith({ limit: 3 });
	});

	it("loads both queries in parallel", async () => {
		let resolveProjects!: (value: Projects) => void;
		vi.mocked(getFeaturedProjects).mockReturnValue(
			new Promise<Projects>((resolve) => {
				resolveProjects = resolve;
			}),
		);
		vi.mocked(getTopSkills).mockResolvedValue([] as unknown as Skills);

		const pending = getHomepageData();
		expect(getTopSkills).toHaveBeenCalled();
		resolveProjects([] as unknown as Projects);
		await pending;
	});
});
