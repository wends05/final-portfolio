import { Link } from "@tanstack/react-router";
import { useStore } from "zustand";
import {
	MENU_BUTTON_ID,
	MENU_PANEL_ID,
} from "#/features/public/utils/menu/menu";
import { menuStore } from "#/features/public/utils/menu/menu-store";
import { cn } from "#/lib/utils";

export default function Navbar() {
	const phase = useStore(menuStore, (s) => s.phase);
	const toggle = useStore(menuStore, (s) => s.toggle);
	const isOpen = phase === "open";
	const isClosed = phase === "closed";

	// Over the ink menu the bar turns paper, and so does its focus ring.
	const focusRing = cn(
		"focus-ring",
		!isClosed && "focus-visible:outline-focus-inverse",
	);

	return (
		<header
			className={cn(
				"page-grid fixed inset-x-0 top-0 z-50 py-4 md:py-5",
				!isClosed && "text-inverse-foreground",
			)}
		>
			<div className="col-span-full flex items-center justify-between">
				<Link
					to="/"
					aria-label="wends.dev, home"
					className={cn(
						"font-semibold text-heading-s leading-11 tracking-tight",
						focusRing,
					)}
				>
					wends.dev
				</Link>

				<button
					id={MENU_BUTTON_ID}
					type="button"
					aria-controls={MENU_PANEL_ID}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Close menu" : "Open menu"}
					onClick={toggle}
					className={cn(
						"group type-label -mr-2.5 flex min-h-11 min-w-11 items-center justify-center gap-3.5 px-2.5 md:mr-0 md:pr-0",
						focusRing,
					)}
				>
					<span className="hidden md:inline">{isOpen ? "Close" : "Menu"}</span>
					{/* Two 2px lines 4px either side of the box's centre, so
					    translate-y-1 plus a 45° turn meets in an ×. */}
					<span aria-hidden className="relative h-2.5 w-6">
						<span className="absolute inset-x-0 top-0 h-0.5 bg-current transition-transform duration-400 ease-swiss group-aria-expanded:translate-y-1 group-aria-expanded:rotate-45 motion-reduce:transition-none" />
						<span className="absolute inset-x-0 bottom-0 h-0.5 bg-current transition-transform duration-400 ease-swiss group-aria-expanded:-translate-y-1 group-aria-expanded:-rotate-45 motion-reduce:transition-none" />
					</span>
				</button>
			</div>
		</header>
	);
}
