import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Footer from "#/features/public/components/Footer";

const markup = renderToStaticMarkup(<Footer />);

describe("Footer", () => {
	it("links the CV as a named download", () => {
		expect(markup).toMatch(
			/<a href="\/cv\.pdf" download="wendell-dador-cv\.pdf" aria-label="Download CV"/,
		);
	});

	it("gives every link the inverse focus ring", () => {
		const links = markup.match(/<a [^>]*>/g) ?? [];

		expect(links.length).toBeGreaterThan(0);
		for (const link of links) {
			expect(link).toContain("focus-ring");
			expect(link).toContain("focus-visible:outline-focus-inverse");
		}
	});
});
