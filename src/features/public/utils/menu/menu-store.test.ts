import { describe, expect, it } from "vitest";
import { createMenuStore } from "./menu-store";

function openStore() {
	const store = createMenuStore();
	store.getState().toggle();
	return store;
}

describe("createMenuStore", () => {
	it("starts closed with no target", () => {
		const { phase, target } = createMenuStore().getState();
		expect(phase).toBe("closed");
		expect(target).toBeNull();
	});

	it("opens on toggle, and a second toggle starts closing", () => {
		const store = openStore();
		expect(store.getState().phase).toBe("open");
		store.getState().toggle();
		expect(store.getState().phase).toBe("closing");
	});

	it("closes from open through closing", () => {
		const store = openStore();
		store.getState().close();
		expect(store.getState().phase).toBe("closing");
		store.getState().finish();
		expect(store.getState().phase).toBe("closed");
	});

	it("leaves for the picked page, then clears the target on finish", () => {
		const store = openStore();
		store.getState().pick("/skills");
		expect(store.getState()).toMatchObject({
			phase: "leaving",
			target: "/skills",
		});
		store.getState().finish();
		expect(store.getState()).toMatchObject({ phase: "closed", target: null });
	});

	it("ignores close, pick and finish while closed", () => {
		const store = createMenuStore();
		store.getState().close();
		store.getState().pick("/skills");
		store.getState().finish();
		expect(store.getState()).toMatchObject({ phase: "closed", target: null });
	});

	it("ignores finish while open", () => {
		const store = openStore();
		store.getState().finish();
		expect(store.getState().phase).toBe("open");
	});

	it("does not let close, toggle or another pick interrupt a pick", () => {
		const store = openStore();
		store.getState().pick("/skills");
		store.getState().close();
		store.getState().toggle();
		store.getState().pick("/projects");
		expect(store.getState()).toMatchObject({
			phase: "leaving",
			target: "/skills",
		});
	});

	it("does not reopen while closing", () => {
		const store = openStore();
		store.getState().close();
		store.getState().toggle();
		expect(store.getState().phase).toBe("closing");
	});

	it("gives each call its own store", () => {
		const first = openStore();
		const second = createMenuStore();
		expect(first.getState().phase).toBe("open");
		expect(second.getState().phase).toBe("closed");
	});
});
