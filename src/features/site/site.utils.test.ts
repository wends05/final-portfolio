import { describe, expect, it } from "vitest";
import {
	type ErrorPageKind,
	getErrorPageCopy,
	getSafeErrorDetail,
	isSiteGated,
	shouldHideError,
} from "./site.utils";

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

describe("getErrorPageCopy", () => {
	it("sends a missing page home or to the projects list", () => {
		const copy = getErrorPageCopy("404");
		expect(copy.code).toBe("404");
		expect(copy.primary).toEqual({ type: "link", label: "Back home", to: "/" });
		expect(copy.secondary).toMatchObject({ type: "link", to: "/projects" });
	});

	it.each<ErrorPageKind>(["500", "error"])(
		"offers a retry first, then home, for %s",
		(kind) => {
			const copy = getErrorPageCopy(kind);
			expect(copy.primary.type).toBe("retry");
			expect(copy.secondary).toMatchObject({ type: "link", to: "/" });
		},
	);

	it.each<ErrorPageKind>(["404", "500", "error"])(
		"has a title and details for %s",
		(kind) => {
			const copy = getErrorPageCopy(kind);
			expect(copy.message).not.toBe("");
			expect(copy.details).not.toBe("");
		},
	);
});

describe("getSafeErrorDetail", () => {
	it("never shows anything outside development", () => {
		expect(
			getSafeErrorDetail(new Error("db password wrong"), false),
		).toBeNull();
		expect(getSafeErrorDetail("boom", false)).toBeNull();
	});

	it("shows the message of an Error, a string or an error-like object", () => {
		expect(getSafeErrorDetail(new Error("connect refused"), true)).toBe(
			"connect refused",
		);
		expect(getSafeErrorDetail("boom", true)).toBe("boom");
		expect(getSafeErrorDetail({ message: "from server fn" }, true)).toBe(
			"from server fn",
		);
	});

	it("returns null when there is nothing readable", () => {
		expect(getSafeErrorDetail(undefined, true)).toBeNull();
		expect(getSafeErrorDetail(null, true)).toBeNull();
		expect(getSafeErrorDetail({ message: 42 }, true)).toBeNull();
		expect(getSafeErrorDetail(new Error("   "), true)).toBeNull();
	});
});

describe("shouldHideError", () => {
	it("hides every Error in production", () => {
		expect(shouldHideError(new Error("connect refused"), false)).toBe(true);
		expect(shouldHideError(new TypeError("bad"), false)).toBe(true);
	});

	it("keeps errors intact in development", () => {
		expect(shouldHideError(new Error("connect refused"), true)).toBe(false);
	});

	it("leaves values that are not Errors alone", () => {
		// notFound() and redirects are not Error instances and must survive.
		expect(shouldHideError({ isNotFound: true }, false)).toBe(false);
		expect(shouldHideError("text", false)).toBe(false);
	});
});
