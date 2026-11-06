import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RollingText from "#/components/RollingText";

describe("RollingText", () => {
	const html = renderToStaticMarkup(<RollingText text="SOME OF MY WORKS" />);

	// SplitText runs on the hidden copy; the sr-only copy names the text, so
	// no plain span carries an aria-label.
	it("gives assistive tech one whole copy of the text", () => {
		expect(html).toContain('<span class="sr-only">SOME OF MY WORKS</span>');
		expect(html).toMatch(
			/<span aria-hidden="true"[^>]*>SOME OF MY WORKS<\/span>/,
		);
		expect(html).not.toContain("aria-label");
	});
});
