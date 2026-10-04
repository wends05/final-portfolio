import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import Footer from "#/components/Footer";
import Navbar from "#/components/Navbar";
import IntroCurtain from "./intro/IntroCurtain";

export default function RootLayout() {
	const [introActive, setIntroActive] = useState(false);
	return (
		<div className="flex-col w-full min-h-screen">
			<IntroCurtain onActiveChange={setIntroActive} />
			<div inert={introActive} className="contents">
				<Navbar />
				<Outlet />
				<Footer />
			</div>
		</div>
	);
}
