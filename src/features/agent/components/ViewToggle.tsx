import { RobotIcon, UserIcon } from "@phosphor-icons/react/ssr";
import { Link, useRouterState } from "@tanstack/react-router";
import { useStore } from "zustand";
import { menuStore } from "#/features/public/utils/menu/menu-store";
import { transitionStore } from "#/features/public/utils/transition/transition-store";
import { cn } from "#/lib/utils";
import { getViewTwins } from "../utils/view-paths";

const option =
	"focus-ring relative flex size-11 items-center justify-center transition-colors duration-300 ease-swiss motion-reduce:transition-none";

/**
 * The Human / Machine toggle (the canvas's A2): two 44px icon links in the
 * bottom-right corner, each to the same page in its view. It sits in the root
 * document, outside both layouts, so the ink block slides from one icon to
 * the other while the route changes. Hidden on pages without a twin (404,
 * errors, coming soon), while the site menu is open, and while a section
 * transition's ink panel covers the page.
 */
export default function ViewToggle() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const failed = useRouterState({
		select: (s) =>
			s.matches.some((m) => m.status === "notFound" || m.status === "error"),
	});
	const menuClosed = useStore(menuStore, (s) => s.phase === "closed");
	const covering = useStore(transitionStore, (s) => s.covering);
	const twins = getViewTwins(pathname);
	if (!twins || failed || !menuClosed || covering) return null;

	const machine = twins.view === "machine";

	return (
		<nav
			aria-label="View"
			className="view-toggle fixed right-4 bottom-4 z-30 flex border border-rule bg-background md:right-6 md:bottom-6"
		>
			<span
				aria-hidden
				className={cn(
					"absolute inset-y-0 left-0 w-11 bg-primary transition-transform duration-300 ease-swiss motion-reduce:transition-none",
					machine && "translate-x-11",
				)}
			/>
			<Link
				to={twins.human}
				aria-label="Human view"
				title="Human view"
				aria-current={machine ? undefined : "page"}
				className={cn(
					option,
					machine ? "text-foreground" : "text-primary-foreground",
				)}
			>
				<UserIcon size={20} aria-hidden />
			</Link>
			<Link
				to={twins.machine}
				aria-label="Machine view"
				title="Machine view"
				aria-current={machine ? "page" : undefined}
				className={cn(
					option,
					machine ? "text-primary-foreground" : "text-foreground",
				)}
			>
				<RobotIcon size={20} aria-hidden />
			</Link>
		</nav>
	);
}
