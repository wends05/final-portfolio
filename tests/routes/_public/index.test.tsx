import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The sections pull in GSAP and Lenis; these tests only need the page wrapper.
vi.mock("#/features/public/components/landing/HeroSection", () => ({
	default: () => <section />,
}));
vi.mock("#/features/public/components/landing/DescriptionSection", () => ({
	default: () => <section />,
}));
vi.mock("#/features/public/components/landing/LandingProjectsSection", () => ({
	default: () => <section />,
}));
vi.mock("#/features/public/components/landing/LandingSkillsSection", () => ({
	default: () => <section />,
}));
vi.mock("#/features/public/components/landing/EndSection", () => ({
	default: () => <section />,
}));
vi.mock("#/features/public/components/landing/ContactSection", () => ({
	default: () => <section />,
}));
vi.mock("#/features/public/public.content", () => ({
	getHomepage: () => ({ featuredProjects: [], topSkills: [] }),
}));

const { Route } = await import("#/routes/_public/index");

const render = () => {
	Route.useLoaderData = (() => ({
		featuredProjects: [],
		topSkills: [],
	})) as typeof Route.useLoaderData;
	const Home = Route.options.component as () => React.JSX.Element;
	return renderToStaticMarkup(<Home />);
};

describe("home page", () => {
	// A screen reader user jumps to the page's content through this landmark.
	it("renders exactly one main landmark", () => {
		expect(render().match(/<main[\s>]/g)).toHaveLength(1);
	});

	it("holds all six landing sections inside the main landmark", () => {
		const html = render();
		expect(html).toMatch(/^<main[^>]*>.*<\/main>$/s);
		expect(html.match(/<section>/g)).toHaveLength(6);
	});
});
