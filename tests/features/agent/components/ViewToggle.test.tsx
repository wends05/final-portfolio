import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({
	state: {
		location: { pathname: "/" },
		matches: [] as { status: string }[],
	},
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
		<a href={to} {...rest}>
			{children}
		</a>
	),
	useRouterState: ({
		select,
	}: {
		select: (s: typeof router.state) => unknown;
	}) => select(router.state),
}));

// Server rendering reads a store's initial state; read the live one instead.
vi.mock("zustand", async (importOriginal) => ({
	...(await importOriginal<typeof import("zustand")>()),
	useStore: <S, T>(store: { getState: () => S }, select: (state: S) => T) =>
		select(store.getState()),
}));

const { default: ViewToggle } = await import(
	"#/features/agent/components/ViewToggle"
);
const { menuStore } = await import("#/features/public/utils/menu/menu-store");
const { transitionStore } = await import(
	"#/features/public/utils/transition/transition-store"
);

function render(pathname: string, status = "success") {
	router.state = {
		location: { pathname },
		matches: [{ status }],
	};
	return renderToStaticMarkup(<ViewToggle />);
}

/** Each link's href and whether it is marked as the current view. */
function links(markup: string) {
	return [...markup.matchAll(/<a ([^>]*)>/g)].map(([, attrs]) => ({
		href: /href="([^"]*)"/.exec(attrs)?.[1],
		label: /aria-label="([^"]*)"/.exec(attrs)?.[1],
		current: attrs.includes('aria-current="page"'),
	}));
}

afterEach(() => {
	menuStore.setState({ phase: "closed", target: null });
	transitionStore.setState({ covering: false });
});

describe("ViewToggle", () => {
	it("links a human page to its agent view, with Human current", () => {
		expect(links(render("/projects/foo"))).toEqual([
			{ href: "/projects/foo", label: "Human view", current: true },
			{ href: "/ai/projects/foo", label: "Machine view", current: false },
		]);
	});

	it("links an agent view back to its human page, with Machine current", () => {
		const markup = render("/ai/skills");
		expect(links(markup)).toEqual([
			{ href: "/skills", label: "Human view", current: false },
			{ href: "/ai/skills", label: "Machine view", current: true },
		]);
		// The ink block sits under the second icon.
		expect(markup).toContain("translate-x-11");
	});

	it("is a labelled group of 44px targets", () => {
		const markup = render("/");
		expect(markup).toContain('<nav aria-label="View"');
		expect(markup.match(/size-11/g)).toHaveLength(2);
	});

	it("hides on pages without a twin, on 404 and error pages", () => {
		expect(render("/coming-soon")).toBe("");
		expect(render("/projects/missing", "notFound")).toBe("");
		expect(render("/ai/projects", "error")).toBe("");
	});

	it("hides while a section transition covers the page", () => {
		transitionStore.setState({ covering: true });
		expect(render("/projects")).toBe("");
	});

	it("hides while the site menu is open", () => {
		menuStore.setState({ phase: "open" });
		expect(render("/")).toBe("");
		menuStore.setState({ phase: "closing" });
		expect(render("/")).toBe("");
	});
});
