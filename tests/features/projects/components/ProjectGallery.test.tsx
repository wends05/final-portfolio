import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectGallery from "#/features/projects/components/ProjectGallery";
import type { ProjectImageView } from "#/features/projects/projects.types";

const shot = (n: number) =>
	({
		image: { src: `/static/${n}.png`, width: 1600, height: 900 },
		alt: `Shot ${n}`,
	}) as ProjectImageView;

const render = (images: ProjectImageView[]) =>
	renderToStaticMarkup(<ProjectGallery title="Wishlist App" images={images} />);

describe("ProjectGallery", () => {
	it("renders nothing without images", () => {
		expect(render([])).toBe("");
	});

	it("offers the full-screen view from the heading row", () => {
		const markup = render([shot(1), shot(2)]);
		expect(markup).toContain('aria-label="View full screen"');
		expect(markup).toContain('aria-haspopup="dialog"');
		expect(markup.indexOf('aria-label="Next image"')).toBeLessThan(
			markup.indexOf('aria-label="View full screen"'),
		);
	});

	it("keeps the expand button, and only it, with one image", () => {
		const markup = render([shot(1)]);
		expect(markup).toContain('aria-label="View full screen"');
		expect(markup).not.toContain('aria-label="Next image"');
		expect(markup).not.toContain('aria-label="Previous image"');
		expect(markup).not.toContain("01 / 01");
	});

	it("does not mount the viewer until it is opened", () => {
		const markup = render([shot(1), shot(2)]);
		expect(markup).not.toContain('role="dialog"');
		expect(markup).not.toContain("Close full screen");
	});

	it("shows the first slide on the page and hides the others", () => {
		const markup = render([shot(1), shot(2)]);
		const slides = [
			...markup.matchAll(
				/<div[^>]*class="([^"]*)"[^>]*><img src="\/static\/(\d)\.png"/g,
			),
		].map((match) => ({ n: match[2], hidden: match[1].includes("invisible") }));
		expect(slides).toEqual([
			{ n: "1", hidden: false },
			{ n: "2", hidden: true },
		]);
	});

	// On phones the counter is too narrow beside the caption and wraps "03 / 03"
	// onto three lines, so it takes its own line and never breaks.
	it("stacks the counter above the caption on phones without wrapping it", () => {
		const markup = render([shot(1), shot(2)]);
		const caption = markup.match(/<p[^>]*class="([^"]*type-meta[^"]*)"/)?.[1];
		expect(caption?.split(" ")).toEqual(
			expect.arrayContaining(["flex-col", "md:flex-row"]),
		);
		const counter = markup.match(/<b class="([^"]*)">01 \/ 02<\/b>/)?.[1];
		expect(counter?.split(" ")).toEqual(
			expect.arrayContaining(["whitespace-nowrap", "shrink-0"]),
		);
	});
});
