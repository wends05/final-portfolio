import { useRouter } from "@tanstack/react-router";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import {
	isInPageJump,
	LENIS_OPTIONS,
	settleLenis,
} from "#/features/public/utils/smooth-scroll";
import { appGSAP } from "#/integrations/animations/gsap";

interface PublicPageLenisProps {
	children: React.ReactNode;
	/** Stops scrolling while the intro curtain or the menu covers the page. */
	scrollLocked: boolean;
}

export default function PublicPageLenis({
	children,
	scrollLocked,
}: PublicPageLenisProps) {
	const lenis = useLenis();
	const router = useRouter();

	useEffect(() => {
		if (!lenis) return;
		lenis.on("scroll", ScrollTrigger.update);

		return () => {
			lenis.off("scroll", ScrollTrigger.update);
		};
	}, [lenis]);

	useEffect(() => {
		if (!lenis) return;
		if (scrollLocked) {
			lenis.stop();
		} else {
			lenis.start();
		}
	}, [scrollLocked, lenis]);

	useEffect(() => {
		if (!lenis) return;

		const update = (time: number) => {
			lenis.raf(time * 1000);
		};
		appGSAP.ticker.add(update);

		return () => appGSAP.ticker.remove(update);
	}, [lenis]);

	// Links, router.navigate and back/forward all pass through here, before
	// scroll restoration moves the page. Anchor jumps keep their glide.
	useEffect(() => {
		if (!lenis) return;
		return router.subscribe("onBeforeNavigate", (event) => {
			if (!isInPageJump(event)) settleLenis(lenis);
		});
	}, [lenis, router]);

	return (
		<ReactLenis root options={LENIS_OPTIONS}>
			{children}
		</ReactLenis>
	);
}
