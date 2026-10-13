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
