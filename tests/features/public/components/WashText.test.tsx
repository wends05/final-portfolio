import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import WashText from "#/features/public/components/landing/WashText";

const washClasses = () => {
	const html = renderToStaticMarkup(<WashText>Perfect Placement</WashText>);
	const wash = html.match(/<span[^>]*data-pick-wash[^>]*>/)?.[0] ?? "";
	const match = wash.match(/class="([^"]+)"/);
	if (!match) throw new Error("No wash span in the markup");
	return match[1].split(" ");
};

describe("WashText", () => {
	// The copy breaks at the same words as the text only when its content box
	// is exactly as wide: each overhang is cancelled by padding of the same size.
	it("pads the wash by the same amount it overhangs on each side", () => {
		const classes = washClasses();
		expect(classes).toContain("left-[-0.12em]");
		expect(classes).toContain("pl-[0.12em]");
		expect(classes).toContain("right-[-0.08em]");
		expect(classes).toContain("pr-[0.08em]");
	});

	it("renders the text twice: the copy in the wash and the text itself", () => {
		const html = renderToStaticMarkup(<WashText>Perfect Placement</WashText>);
		expect(html.match(/Perfect Placement/g)).toHaveLength(2);
	});
});
