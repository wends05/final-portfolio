import { readFile } from "node:fs/promises";
import path from "node:path";
import { compile } from "@tailwindcss/node";
import { beforeAll, describe, expect, it } from "vitest";

const STYLES = path.resolve("src/styles.css");

// Builds the app stylesheet for the given classes and returns the utilities layer.
let buildUtilities: (classes: string[]) => string;

beforeAll(async () => {
	const compiler = await compile(await readFile(STYLES, "utf8"), {
		base: path.dirname(STYLES),
		onDependency: () => {},
	});
	buildUtilities = (classes) => {
		const css = compiler.build(classes);
		const start = css.indexOf("@layer utilities");
		return css.slice(start, css.indexOf("\n}\n", start));
	};
});

describe("focus-ring", () => {
	it("draws a 2px solid focus outline on :focus-visible only", () => {
		const css = buildUtilities(["focus-ring"]);

		expect(css).toMatch(
			/\.focus-ring \{\s*outline-style: none;\s*&:focus-visible \{\s*outline: 2px solid var\(--focus\);\s*outline-offset: 2px;/,
		);
	});

	it("comes before focus-visible color and offset utilities, so they override it", () => {
		const css = buildUtilities([
			"focus-visible:outline-focus-inverse",
			"focus-visible:outline-offset-4",
			"focus-ring",
		]);
		const ring = css.indexOf(".focus-ring");

		expect(ring).toBeGreaterThan(-1);
		expect(css.indexOf("outline-focus-inverse:focus-visible")).toBeGreaterThan(
			ring,
		);
		expect(css.indexOf("outline-offset-4:focus-visible")).toBeGreaterThan(ring);
	});

	it("is needed because outline-none disables outline-2", () => {
		const css = buildUtilities(["outline-none", "focus-visible:outline-2"]);

		expect(css).toContain("--tw-outline-style: none;");
		expect(css).toContain("outline-style: var(--tw-outline-style);");
	});
});

describe("utilities that stand in for arbitrary values", () => {
	it("pads and offsets a wash box by its overhang, in em", () => {
		const css = buildUtilities([
			"-left-overhang",
			"-right-overhang-sm",
			"pl-overhang",
			"-mb-overhang",
		]);

		expect(css).toContain("left: calc(var(--spacing-overhang) * -1);");
		expect(css).toContain("right: calc(var(--spacing-overhang-sm) * -1);");
		expect(css).toContain("padding-left: var(--spacing-overhang);");
		expect(css).toContain("margin-bottom: calc(var(--spacing-overhang) * -1);");
	});

	it("hides a wash by clipping it from the right", () => {
		expect(buildUtilities(["wash-hidden"])).toContain(
			"clip-path: inset(0% 100% 0% 0%);",
		);
	});

	it.each([
		["transition-fade-rise", "opacity, translate"],
		["transition-reveal", "opacity, translate, visibility"],
		["transition-colors-scale", "background-color, color, scale"],
	])(
		"%s transitions %s and reads duration-* and ease-*",
		(name, properties) => {
			const css = buildUtilities([name]);

			expect(css).toContain(`transition-property: ${properties};`);
			expect(css).toContain(
				"var(--tw-duration, var(--default-transition-duration))",
			);
			expect(css).toContain(
				"var( --tw-ease, var(--default-transition-timing-function) )",
			);
		},
	);

	it("sizes a grid from the leftover height", () => {
		const css = buildUtilities([
			"grid-rows-fill-auto",
			"grid-rows-auto-auto-fill",
		]);

		expect(css).toContain("grid-template-rows: 1fr auto;");
		expect(css).toContain("grid-template-rows: auto auto minmax(0, 1fr);");
	});

	it("reads a dynamic height or delay from a custom property", () => {
		const css = buildUtilities(["h-(--track)", "delay-(--stagger)"]);

		expect(css).toContain("height: var(--track);");
		expect(css).toContain("transition-delay: var(--stagger);");
	});

	it("mixes the secondary hover color from the theme", () => {
		expect(buildUtilities(["hover:bg-secondary-hover"])).toMatch(
			/color-mix\(\s*in oklch,\s*var\(--secondary\),\s*var\(--foreground\) 5%\s*\)/,
		);
	});

	it("sets the text-2xs size", () => {
		expect(buildUtilities(["text-2xs"])).toContain(
			"font-size: var(--text-2xs);",
		);
	});
});
