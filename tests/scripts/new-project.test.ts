import { describe, expect, it } from "vitest";
import {
	isProjectSlug,
	projectTemplate,
	titleFromSlug,
	toDateString,
} from "../../scripts/new-project.utils";

describe("isProjectSlug", () => {
	it("accepts lowercase kebab-case", () => {
		expect(isProjectSlug("baconawa-and-eggs")).toBe(true);
		expect(isProjectSlug("app2")).toBe(true);
	});

	it("rejects other forms", () => {
		for (const slug of [
			"",
			"ab",
			"Baconawa",
			"two--dashes",
			"-start",
			"a_b",
			"a b",
		]) {
			expect(isProjectSlug(slug)).toBe(false);
		}
	});
});

describe("titleFromSlug", () => {
	it("capitalises each word", () => {
		expect(titleFromSlug("baconawa-and-eggs")).toBe("Baconawa And Eggs");
	});
});

describe("toDateString", () => {
	it("uses the local calendar date", () => {
		expect(toDateString(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
	});
});

describe("projectTemplate", () => {
	const file = projectTemplate("demo-app", "2026-10-19");

	it("fills the required fields and starts as a draft", () => {
		expect(file).toContain("slug: demo-app\n");
		expect(file).toContain('title: "Demo App"\n');
		expect(file).toContain("startedAt: 2026-10-19\n");
		expect(file).toContain("status: ONGOING\n");
		expect(file).toMatch(/^draft: true\b/m);
	});

	it("ends the frontmatter before the write-up headings", () => {
		expect(file.startsWith("---\n")).toBe(true);
		expect(file).toMatch(/\n---\n## Problem\n/);
	});
});
