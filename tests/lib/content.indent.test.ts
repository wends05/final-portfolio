import { describe, expect, it } from "vitest";
import { tabsToSpaces } from "#/lib/content.indent";

describe("tabsToSpaces", () => {
	it("turns a leading tab into two spaces", () => {
		expect(tabsToSpaces("\t- item")).toBe("  - item");
	});

	it("uses tab stops, so a tab after a space lands on the next stop", () => {
		expect(tabsToSpaces(" \t- item")).toBe("  - item");
	});

	it("expands each leading tab separately", () => {
		expect(tabsToSpaces("\t\t- nested")).toBe("    - nested");
	});

	it("leaves lines without leading tabs as they are", () => {
		const text = "## Heading\n  already spaced\nno indent";
		expect(tabsToSpaces(text)).toBe(text);
	});

	it("keeps tabs that come after the text", () => {
		expect(tabsToSpaces("a\tb")).toBe("a\tb");
	});
});
