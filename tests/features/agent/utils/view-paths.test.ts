import { describe, expect, it } from "vitest";
import {
	agentCopyPath,
	agentViewLink,
	agentViewPath,
	getViewTwins,
} from "#/features/agent/utils/view-paths";

const ORIGIN = "https://portfolio.wends.dev";

describe("getViewTwins", () => {
	it("maps each human page to its agent view", () => {
		expect(getViewTwins("/")).toEqual({
			view: "human",
			human: "/",
			machine: "/ai",
		});
		expect(getViewTwins("/projects")?.machine).toBe("/ai/projects");
		expect(getViewTwins("/projects/foo")?.machine).toBe("/ai/projects/foo");
		expect(getViewTwins("/skills")?.machine).toBe("/ai/skills");
		expect(getViewTwins("/skills/web")?.machine).toBe("/ai/skills/web");
	});

	it("maps each agent view back to its human page", () => {
		expect(getViewTwins("/ai")).toEqual({
			view: "machine",
			human: "/",
			machine: "/ai",
		});
		expect(getViewTwins("/ai/projects/foo")).toEqual({
			view: "machine",
			human: "/projects/foo",
			machine: "/ai/projects/foo",
		});
		expect(getViewTwins("/ai/skills")?.human).toBe("/skills");
	});

	it("ignores a trailing slash", () => {
		expect(getViewTwins("/projects/")?.machine).toBe("/ai/projects");
		expect(getViewTwins("/ai/")?.human).toBe("/");
	});

	it("has no twins for other paths", () => {
		for (const path of [
			"/coming-soon",
			"/projects/foo/bar",
			"/ai/coming-soon",
			"/ai/ai",
			"/aix",
			"/skills/a/b",
		]) {
			expect(getViewTwins(path)).toBeNull();
		}
	});
});

describe("agentViewPath and agentCopyPath", () => {
	it("give the agent view and the .md file of a page", () => {
		expect(agentViewPath("/")).toBe("/ai");
		expect(agentViewPath("/skills/web/")).toBe("/ai/skills/web");
		expect(agentCopyPath("/")).toBe("/index.md");
		expect(agentCopyPath("/projects")).toBe("/projects.md");
		expect(agentCopyPath("/projects/foo")).toBe("/projects/foo.md");
	});
});

describe("agentViewLink", () => {
	it("keeps links to the site's pages inside the agent view", () => {
		expect(agentViewLink(`${ORIGIN}/projects/foo`, ORIGIN)).toBe(
			"/ai/projects/foo",
		);
		expect(agentViewLink(`${ORIGIN}/`, ORIGIN)).toBe("/ai");
		expect(agentViewLink(ORIGIN, `${ORIGIN}/`)).toBe("/ai");
		expect(agentViewLink("/skills", ORIGIN)).toBe("/ai/skills");
	});

	it("leaves files, other sites and protocol-relative links alone", () => {
		expect(agentViewLink(`${ORIGIN}/projects/foo.md`, ORIGIN)).toBeNull();
		expect(agentViewLink(`${ORIGIN}/llms.txt`, ORIGIN)).toBeNull();
		expect(agentViewLink("https://github.com/wends05", ORIGIN)).toBeNull();
		expect(agentViewLink("//evil.example/projects", ORIGIN)).toBeNull();
		expect(agentViewLink(`${ORIGIN}.evil.example/projects`, ORIGIN)).toBeNull();
	});
});
