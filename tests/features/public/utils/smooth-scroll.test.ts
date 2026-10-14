import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
	isInPageJump,
	LENIS_OPTIONS,
	settleLenis,
} from "#/features/public/utils/smooth-scroll";

function fakeLenis(isStopped: boolean) {
	const calls: string[] = [];
	return {
		calls,
		isStopped,
		stop: vi.fn(() => calls.push("stop")),
		start: vi.fn(() => calls.push("start")),
	};
}

describe("LENIS_OPTIONS", () => {
	it("keeps touch scrolling native and smooths only the wheel", () => {
		expect(LENIS_OPTIONS.syncTouch).toBe(false);
		expect(LENIS_OPTIONS.smoothWheel).toBe(true);
	});

	it("turns smoothing off under reduced motion", () => {
		expect(LENIS_OPTIONS.respectReducedMotion).toBe(true);
	});

	it("leaves the frame loop to GSAP's ticker", () => {
		expect(LENIS_OPTIONS.autoRaf).toBe(false);
	});

	it("glides same-page anchor links", () => {
		expect(LENIS_OPTIONS.anchors).toBe(true);
	});
});

describe("settleLenis", () => {
	it("stops then starts a running Lenis, dropping its glide", () => {
		const lenis = fakeLenis(false);
		settleLenis(lenis);

		expect(lenis.calls).toEqual(["stop", "start"]);
	});

	it("leaves a stopped Lenis stopped", () => {
		const lenis = fakeLenis(true);
		settleLenis(lenis);

		expect(lenis.stop).not.toHaveBeenCalled();
		expect(lenis.start).not.toHaveBeenCalled();
	});
});

describe("isInPageJump", () => {
	const at = (pathname: string, searchStr = "") => ({ pathname, searchStr });

	it("is true for a hash change on the same page", () => {
		expect(isInPageJump({ fromLocation: at("/"), toLocation: at("/") })).toBe(
			true,
		);
	});

	it("is false when the path changes", () => {
		expect(
			isInPageJump({ fromLocation: at("/"), toLocation: at("/skills") }),
		).toBe(false);
	});

	it("is false when the search changes", () => {
		expect(
			isInPageJump({
				fromLocation: at("/projects"),
				toLocation: at("/projects", "?tag=web"),
			}),
		).toBe(false);
	});

	it("is false for the first navigation", () => {
		expect(isInPageJump({ toLocation: at("/") })).toBe(false);
	});
});

describe("navbar offset", () => {
	const css = readFileSync(
		fileURLToPath(
			new URL("../../../../src/styles/portfolio.css", import.meta.url),
		),
		"utf8",
	);

	it("pads in-page jumps by the navbar height", () => {
		const html = css.match(/^html\s*\{([^}]*)\}/m)?.[1] ?? "";

		expect(html).toMatch(/scroll-padding-top:\s*var\(--navbar-height\)/);
	});

	it("defines the navbar height at every width", () => {
		const heights = [...css.matchAll(/--navbar-height:\s*([\d.]+rem)/g)].map(
			(m) => m[1],
		);

		// py-4 / md:py-5 around the 2.75rem (leading-11) row.
		expect(heights).toEqual(["4.75rem", "5.25rem"]);
	});
});
