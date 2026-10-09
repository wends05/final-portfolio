import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import Footer from "#/components/Footer";
import Navbar from "#/components/Navbar";
import IntroCurtain from "./intro/IntroCurtain";
import PublicPageLenis from "./PublicPageLenis";

export default function RootLayout() {
	const [introActive, setIntroActive] = useState(false);
	return (
		<PublicPageLenis introActive={introActive}>
			<div className="min-h-screen w-full flex-col">
				<IntroCurtain onActiveChange={setIntroActive} />
				<div inert={introActive} className="contents min-h-screen">
					<Navbar />
					<div className="min-h-screen">
						<Outlet />
					</div>
					<Footer />
				</div>
			</div>
		</PublicPageLenis>
	);
}
