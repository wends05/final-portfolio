import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { EASES } from "./eases";

describe("EASES", () => {
	it("matches the --ease-swiss token in portfolio.css", () => {
		const css = readFileSync(
			fileURLToPath(new URL("../../styles/portfolio.css", import.meta.url)),
			"utf8",
		);
		const match = css.match(/--ease-swiss:\s*cubic-bezier\(([^)]*)\)/);

		expect(match?.[1].replace(/\s+/g, "")).toBe(EASES.swiss);
	});
});
