import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The site has no admin area (ADR 0019), so the generated tree lists only
// public pages.
const routeTree = readFileSync(
	new URL("../../src/routeTree.gen.ts", import.meta.url),
	"utf8",
);

describe("route tree", () => {
	it("has no dashboard routes", () => {
		expect(routeTree).not.toMatch(/_dashboard|\/auth\b/);
	});
});
