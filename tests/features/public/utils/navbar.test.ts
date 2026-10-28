import { describe, expect, it } from "vitest";
import {
	isNavbarSolid,
	NAVBAR_SOLID_SCROLL,
} from "#/features/public/utils/navbar";

describe("isNavbarSolid", () => {
	it("stays transparent at the top of the page", () => {
		expect(isNavbarSolid(0)).toBe(false);
	});

	it("ignores a small nudge", () => {
		expect(isNavbarSolid(NAVBAR_SOLID_SCROLL)).toBe(false);
	});

	it("turns solid once the page has scrolled past the threshold", () => {
		expect(isNavbarSolid(NAVBAR_SOLID_SCROLL + 1)).toBe(true);
		expect(isNavbarSolid(2400)).toBe(true);
	});
});
