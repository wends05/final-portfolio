import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { agentCopyPath, getViewTwins } from "../utils/view-paths";

const NAV = [
	{ to: "/ai", label: "home" },
	{ to: "/ai/projects", label: "projects" },
	{ to: "/ai/skills", label: "skills" },
] as const;

const barLink =
	"focus-ring inline-flex min-h-11 items-center px-2 underline-offset-2 hover:underline";

/**
 * The plain layout for the agent views (ADR 0021): mono type on the theme's
 * ground, a small header with the three pages and the page's `.md` file. No
 * intro curtain, smooth scroll, or footer.
 */
export default function AgentLayout() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const twins = getViewTwins(pathname);
	const file = twins ? agentCopyPath(twins.human) : null;

	return (
		<div className="min-h-svh bg-background font-label text-body-s text-foreground">
			<header className="flex flex-wrap items-center justify-between gap-x-6 border-rule-soft border-b px-2 py-1 md:px-4">
				<nav aria-label="Agent view" className="flex">
					{NAV.map((item) => (
						<Link
							key={item.to}
							to={item.to}
							activeOptions={{ exact: item.to === "/ai" }}
							activeProps={{ "aria-current": "page", className: "underline" }}
							className={barLink}
						>
							{item.label}
						</Link>
					))}
				</nav>
				{file && (
					<a href={file} className={barLink}>
						{file.slice(file.lastIndexOf("/") + 1)} <span aria-hidden>↗</span>
					</a>
				)}
			</header>
			{/* Keyed by path, so each page fades in when the view or page changes. */}
			<main
				key={pathname}
				className="motion-safe:fade-in mx-auto max-w-3xl px-4 pt-14 pb-32 motion-safe:animate-in motion-safe:duration-200"
			>
				<p className="mb-6 text-muted-foreground">{pathname}</p>
				<Outlet />
			</main>
		</div>
	);
}
