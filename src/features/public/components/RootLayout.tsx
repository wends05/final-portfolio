import { Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import Footer from "#/features/public/components/Footer";
import IntroCurtain from "#/features/public/components/intro/IntroCurtain";
import SiteMenu from "#/features/public/components/menu/SiteMenu";
import Navbar from "#/features/public/components/Navbar";
import SectionTransition from "#/features/public/components/transition/SectionTransition";
import { skipIntro } from "#/features/public/utils/intro";
import { menuStore } from "#/features/public/utils/menu/menu-store";
import { transitionStore } from "#/features/public/utils/transition/transition-store";
import PublicPageLenis from "./PublicPageLenis";

export default function RootLayout() {
	const [introActive, setIntroActive] = useState(false);
	const menuOpen = useStore(menuStore, (s) => s.phase !== "closed");
	const covering = useStore(transitionStore, (s) => s.covering);
	const page = useRef<HTMLDivElement>(null);
	// Not-found and error pages show at once: no curtain, and release the
	// scroll lock the head script set for it.
	const showingError = useRouterState({
		select: (s) =>
			s.matches.some((m) => m.status === "notFound" || m.status === "error"),
	});
	useEffect(() => {
		if (showingError) skipIntro();
	}, [showingError]);

	return (
		<PublicPageLenis scrollLocked={introActive || menuOpen || covering}>
			<div className="min-h-screen w-full flex-col">
				{!showingError && <IntroCurtain onActiveChange={setIntroActive} />}
				{/* The ink panel of a section transition, over the bar and footer. */}
				<SectionTransition page={page} />
				<div inert={introActive || covering} className="contents min-h-screen">
					<Navbar />
					<SiteMenu />
					{/* While the menu is open only the bar and the menu take input. */}
					<div inert={menuOpen} className="contents">
						<div ref={page} className="min-h-screen">
							<Outlet />
						</div>
						<Footer />
					</div>
				</div>
			</div>
		</PublicPageLenis>
	);
}
