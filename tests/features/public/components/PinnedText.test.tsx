import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PinnedText from "#/features/public/components/landing/PinnedText";

const paragraphs = ["I build things for the web.", "Then I write about them."];

describe("PinnedText", () => {
	const html = renderToStaticMarkup(<PinnedText paragraphs={paragraphs} />);

	// The words split for the ink animation live in a hidden copy, so a screen
	// reader reads each paragraph once, as one sentence, from the sr-only copy.
	it("pairs each paragraph's split copy with one whole sr-only copy", () => {
		for (const paragraph of paragraphs) {
			expect(html).toContain(`<span class="sr-only">${paragraph}</span>`);
			expect(html).toMatch(
				new RegExp(
					`<span data-split="true" aria-hidden="true"[^>]*>${paragraph}</span>`,
				),
			);
		}
	});

	it("puts no aria-label on the paragraphs", () => {
		expect(html).not.toContain("aria-label");
	});
});
