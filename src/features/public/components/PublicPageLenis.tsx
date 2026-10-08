import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect } from "react";
import { appGSAP } from "#/integrations/animations/gsap";

interface PublicPageLenisProps {
	children: React.ReactNode;
	introActive: boolean;
}

export default function PublicPageLenis({
	children,
	introActive,
}: PublicPageLenisProps) {
	const lenis = useLenis();

	useEffect(() => {
		if (!lenis) return;
		lenis.on("scroll", ScrollTrigger.update);

		return () => {
			lenis.off("scroll", ScrollTrigger.update);
		};
	}, [lenis]);

	useEffect(() => {
		if (!lenis) return;
		if (introActive) {
			lenis.stop();
		} else {
			lenis.start();
		}
	}, [introActive, lenis]);

	useEffect(() => {
		if (!lenis) return;

		const update = (time: number) => {
			lenis.raf(time * 1000);
		};
		appGSAP.ticker.add(update);

		return () => appGSAP.ticker.remove(update);
	}, [lenis]);

	return (
		<ReactLenis
			root
			options={{ autoRaf: false, respectReducedMotion: true, lerp: 0.2 }}
		>
			{children}
		</ReactLenis>
	);
}
