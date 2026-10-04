import { Outlet } from "@tanstack/react-router";
import Footer from "#/components/Footer";
import Navbar from "#/components/Navbar";

export default function RootLayout() {
	return (
		<div className="flex-col w-full min-h-screen">
			<Navbar />
			<Outlet />
			<Footer />
		</div>
	);
}
