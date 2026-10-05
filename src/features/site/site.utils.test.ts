import { describe, expect, it } from "vitest";
import { isSiteGated } from "./site.utils";

describe("isSiteGated", () => {
	it("is open when COMING_SOON is not 'true'", () => {
		expect(
			isSiteGated({
				comingSoon: undefined,
				previewToken: undefined,
				previewCookie: undefined,
			}),
		).toBe(false);
		expect(
			isSiteGated({
				comingSoon: "false",
				previewToken: "t",
				previewCookie: undefined,
			}),
		).toBe(false);
	});

	it("gates visitors without a matching preview cookie", () => {
		expect(
			isSiteGated({
				comingSoon: "true",
				previewToken: "t",
				previewCookie: undefined,
			}),
		).toBe(true);
		expect(
			isSiteGated({
				comingSoon: "true",
				previewToken: "t",
				previewCookie: "wrong",
			}),
		).toBe(true);
	});

	it("lets a matching preview cookie through", () => {
		expect(
			isSiteGated({
				comingSoon: "true",
				previewToken: "t",
				previewCookie: "t",
			}),
		).toBe(false);
	});

	it("never bypasses when no preview token is configured", () => {
		expect(
			isSiteGated({
				comingSoon: "true",
				previewToken: undefined,
				previewCookie: undefined,
			}),
		).toBe(true);
		expect(
			isSiteGated({
				comingSoon: "true",
				previewToken: "",
				previewCookie: "",
			}),
		).toBe(true);
	});
});
