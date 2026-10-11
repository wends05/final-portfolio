import { describe, expect, it } from "vitest";
import { isCurrentPage, isCurrentSection } from "./menu";

describe("isCurrentPage", () => {
	it("matches the exact path", () => {
		expect(isCurrentPage("/", "/")).toBe(true);
		expect(isCurrentPage("/projects", "/projects")).toBe(true);
	});

	it("ignores a trailing slash", () => {
		expect(isCurrentPage("/projects", "/projects/")).toBe(true);
	});

	it("does not match a page inside the section", () => {
		expect(isCurrentPage("/projects", "/projects/portfolio")).toBe(false);
	});

	it("does not treat home as the parent of every page", () => {
		expect(isCurrentPage("/", "/skills")).toBe(false);
	});
});

describe("isCurrentSection", () => {
	it("matches the section's own page and the pages inside it", () => {
		expect(isCurrentSection("/projects", "/projects")).toBe(true);
		expect(isCurrentSection("/projects", "/projects/portfolio")).toBe(true);
	});

	it("matches home only on home", () => {
		expect(isCurrentSection("/", "/")).toBe(true);
		expect(isCurrentSection("/", "/projects")).toBe(false);
	});

	it("does not match another section", () => {
		expect(isCurrentSection("/skills", "/projects/portfolio")).toBe(false);
	});
});
