import { Link } from "@tanstack/react-router";
import type { Ref } from "react";
import { useStore } from "zustand";
import {
	isCurrentPage,
	isCurrentSection,
	type MENU_ITEMS,
} from "#/features/public/utils/menu/menu";
import { menuStore } from "#/features/public/utils/menu/menu-store";
import { cn } from "#/lib/utils";

interface MenuItemProps {
	item: (typeof MENU_ITEMS)[number];
	pathname: string;
	ref?: Ref<HTMLAnchorElement>;
}

// One row of the site menu. The data attributes data-menu-dot, data-menu-word
// and data-pick-wash are the targets of SiteMenu's GSAP timelines.
export default function MenuItem({ item, pathname, ref }: MenuItemProps) {
	const close = useStore(menuStore, (s) => s.close);
	const pick = useStore(menuStore, (s) => s.pick);
	const currentPage = isCurrentPage(item.to, pathname);

	return (
		<li className="border-rule-inverse border-t">
			<Link
				ref={ref}
				to={item.to}
				aria-current={currentPage ? "page" : undefined}
				onClick={(e) => {
					e.preventDefault();
					if (currentPage) {
						close();
					} else {
						pick(item.to);
					}
				}}
				className="focus-ring flex items-center gap-4 pt-3 pb-2 text-display-xl focus-visible:outline-focus-inverse group-hover/list:not-hover:text-inverse-muted md:gap-6"
			>
				<span
					aria-hidden
					data-menu-dot
					data-current={currentPage || undefined}
					className={cn(
						"size-3 shrink-0 rounded-full md:size-3.5",
						isCurrentSection(item.to, pathname) && "bg-inverse-foreground",
					)}
				/>
				{/* The mask: clips the word while it rises. The em padding
				    keeps descenders (p, j) and the wash's left overhang
				    inside it, and the negative margins keep the row still. */}
				<span className="-mb-overhang -ml-overhang block grow overflow-hidden pb-overhang pl-overhang">
					{/* The part that moves: the word and its wash rise together. */}
					<span data-menu-word className="relative inline-block">
						<span>{item.label}</span>
						{/* Paper box holding an ink copy of the word, hidden by its
						    clip-path (wash-hidden). On a pick, the leaving timeline reveals it
						    left to right, so the word turns ink at the wash's edge.
						    The left padding equals the left overhang, so the copy
						    lines up with the word underneath. */}
						<span
							aria-hidden
							data-pick-wash
							className="wash-hidden absolute inset-y-0 -right-overhang-sm -left-overhang whitespace-nowrap bg-inverse-foreground pl-overhang text-inverse"
						>
							{item.label}
						</span>
					</span>
				</span>
			</Link>
		</li>
	);
}
