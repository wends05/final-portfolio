import { describe, expect, it } from "vitest";
import { isSiteGated } from "./site.utils";

describe("isSiteGated", () => {
	it("is open when COMING_SOON is not 'true'", () => {
		expect(isSiteGated(undefined)).toBe(false);
		expect(isSiteGated("")).toBe(false);
		expect(isSiteGated("false")).toBe(false);
	});

	it("gates every visitor when COMING_SOON is 'true'", () => {
		expect(isSiteGated("true")).toBe(true);
	});
});
