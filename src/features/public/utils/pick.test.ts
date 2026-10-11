import { describe, expect, it } from "vitest";
import { isPlainClick } from "./pick";

const click = (
	overrides: Partial<Parameters<typeof isPlainClick>[0]> = {},
) => ({
	button: 0,
	metaKey: false,
	ctrlKey: false,
	shiftKey: false,
	altKey: false,
	...overrides,
});

describe("isPlainClick", () => {
	it("takes a plain left click", () => {
		expect(isPlainClick(click())).toBe(true);
	});

	it.each([
		["meta (Cmd: new tab on macOS)", { metaKey: true }],
		["ctrl (new tab on Windows and Linux)", { ctrlKey: true }],
		["shift (new window)", { shiftKey: true }],
		["alt (download)", { altKey: true }],
	])("leaves a %s click to the browser", (_, modifier) => {
		expect(isPlainClick(click(modifier))).toBe(false);
	});

	it.each([
		["middle", 1],
		["right", 2],
	])("leaves a %s-button click to the browser", (_, button) => {
		expect(isPlainClick(click({ button }))).toBe(false);
	});

	it("leaves a left click with several modifiers to the browser", () => {
		expect(isPlainClick(click({ metaKey: true, shiftKey: true }))).toBe(false);
	});
});
