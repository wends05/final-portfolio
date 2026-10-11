import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "zustand";
import Footer from "#/features/public/components/Footer";
import IntroCurtain from "#/features/public/components/intro/IntroCurtain";
import SiteMenu from "#/features/public/components/menu/SiteMenu";
import Navbar from "#/features/public/components/Navbar";
import { menuStore } from "#/features/public/utils/menu/menu-store";
import PublicPageLenis from "./PublicPageLenis";

export default function RootLayout() {
	const [introActive, setIntroActive] = useState(false);
	const menuOpen = useStore(menuStore, (s) => s.phase !== "closed");
	return (
		<PublicPageLenis scrollLocked={introActive || menuOpen}>
			<div className="min-h-screen w-full flex-col">
				<IntroCurtain onActiveChange={setIntroActive} />
				<div inert={introActive} className="contents min-h-screen">
					<Navbar />
					<SiteMenu />
					{/* While the menu is open only the bar and the menu take input. */}
					<div inert={menuOpen} className="contents">
						<div className="min-h-screen">
							<Outlet />
						</div>
						<Footer />
					</div>
				</div>
			</div>
		</PublicPageLenis>
	);
}
