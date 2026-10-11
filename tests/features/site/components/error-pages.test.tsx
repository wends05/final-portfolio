import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	notFound,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "#/features/site/components/ErrorPage";
import RouteErrorPage from "#/features/site/components/RouteErrorPage";

// A router wired like src/router.tsx, with one page whose loader we control.
function setup(loader: () => unknown) {
	const rootRoute = createRootRoute({ component: Outlet });
	const page = createRoute({
		getParentRoute: () => rootRoute,
		path: "/page",
		loader,
		component: () => <p>page loaded</p>,
	});
	const router = createRouter({
		routeTree: rootRoute.addChildren([page]),
		history: createMemoryHistory({ initialEntries: ["/page"] }),
		defaultNotFoundComponent: () => <ErrorPage errorKind="404" />,
		defaultErrorComponent: RouteErrorPage,
	});
	const render = () => renderToString(<RouterProvider router={router} />);
	const pageStatus = () =>
		// routeId is typed against the app's registered routes, not this tree.
		router.state.matches.find((m) => (m.routeId as string) === "/page")?.status;
	return { router, render, pageStatus };
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("error boundary", () => {
	it("renders the error page with a retry when a loader throws", async () => {
		const log = vi.spyOn(console, "error").mockImplementation(() => {});
		const { router, render, pageStatus } = setup(() => {
			throw new Error("database unreachable");
		});

		await router.load();
		const html = render();

		expect(pageStatus()).toBe("error");
		expect(html).toContain("this page didn&#x27;t load");
		expect(html).toContain("Try again");
		expect(html).toContain("/page");
		// Rendered on the server: the real error goes to the logs.
		expect(log).toHaveBeenCalledWith(
			expect.objectContaining({ message: "database unreachable" }),
		);
	});

	it("recovers on retry once the loader succeeds", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		let fail = true;
		const { router, render, pageStatus } = setup(() => {
			if (fail) throw new Error("flaky");
			return null;
		});

		await router.load();
		expect(pageStatus()).toBe("error");

		fail = false;
		// What "Try again" does.
		await router.invalidate();

		expect(pageStatus()).toBe("success");
		expect(render()).toContain("page loaded");
	});
});

describe("not-found page", () => {
	it("renders the 404 with links home and to projects", async () => {
		const { router, render, pageStatus } = setup(() => {
			throw notFound();
		});

		await router.load();
		const html = render();

		expect(pageStatus()).toBe("notFound");
		expect(html).toContain("this page does not exist");
		expect(html).toContain('href="/"');
		expect(html).toContain('href="/projects"');
		expect(html).not.toContain("Try again");
	});
});
