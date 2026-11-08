import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Footer from "#/features/public/components/Footer";

describe("Footer", () => {
	it("links the CV as a named download", () => {
		expect(renderToStaticMarkup(<Footer />)).toMatch(
			/<a href="\/cv\.pdf" download="wendell-dador-cv\.pdf" aria-label="Download CV">/,
		);
	});
});
