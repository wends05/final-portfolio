import { describe, expect, it, vi } from "vitest";
import { followNavigation, isPlainClick } from "./pick";

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

describe("followNavigation", () => {
	it("calls onArrive when the navigation resolves", async () => {
		const onArrive = vi.fn();
		const onFail = vi.fn();
		await expect(
			followNavigation(() => Promise.resolve(), { onArrive, onFail }),
		).resolves.toBe(true);
		expect(onArrive).toHaveBeenCalledOnce();
		expect(onFail).not.toHaveBeenCalled();
	});

	it("calls onFail instead of rejecting when the navigation rejects", async () => {
		const onArrive = vi.fn();
		const onFail = vi.fn();
		await expect(
			followNavigation(() => Promise.reject(new Error("offline")), {
				onArrive,
				onFail,
			}),
		).resolves.toBe(false);
		expect(onFail).toHaveBeenCalledOnce();
		expect(onArrive).not.toHaveBeenCalled();
	});

	it("calls onFail when starting the navigation throws", async () => {
		const onFail = vi.fn();
		await expect(
			followNavigation(
				() => {
					throw new Error("bad route");
				},
				{ onArrive: vi.fn(), onFail },
			),
		).resolves.toBe(false);
		expect(onFail).toHaveBeenCalledOnce();
	});
});
