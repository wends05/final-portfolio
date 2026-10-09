import {
	GithubLogoIcon,
	type Icon,
	LinkedinLogoIcon,
} from "@phosphor-icons/react";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import {
	FULL_MOTION,
	INTRO_HERO_DELAY,
	introPlaying,
	REDUCED_MOTION,
} from "../../lib/intro";

const links: { href: string; label: string; Icon: Icon }[] = [
	{ label: "GitHub", Icon: GithubLogoIcon, href: "https://github.com/wends05" },
	{
		label: "LinkedIn",
		Icon: LinkedinLogoIcon,
		href: "https://linkedin.com/in/rencee05",
	},
];

export default function HeroSection() {
	const root = useRef<HTMLElement>(null);
	const nameRef = useRef<HTMLHeadingElement>(null);

	// Elements marked data-reveal start hidden (intro.css) until this runs.
	useAppGSAP(
		() => {
			const el = root.current;
			const name = nameRef.current;
			if (!el || !name) return;
			const reveals = appGSAP.utils.toArray<HTMLElement>("[data-reveal]", el);
			for (const item of reveals) item.style.animation = "none"; // cancel the CSS fail-safe
			const delay = introPlaying() ? INTRO_HERO_DELAY : 0;

			appGSAP
				.matchMedia()
				.add(
					{ motion: FULL_MOTION, reduce: REDUCED_MOTION },
					({ conditions }) => {
						const tl = appGSAP.timeline({ delay });

						if (conditions?.reduce) {
							tl.fromTo(
								reveals,
								{ autoAlpha: 0 },
								{ autoAlpha: 1, duration: 0.8, ease: "none" },
							);
							return;
						}

						// Words rise out of their own masks; the h1 itself is shown
						// at once because the masks already hide the words.
						const split = SplitText.create(name, {
							type: "words",
							mask: "words",
						});
						appGSAP.set(name, { autoAlpha: 1 });
						tl.from(
							split.words,
							{
								yPercent: 110,
								duration: 1.2,
								ease: "swiss",
								stagger: 0.1,
							},
							0.3,
						).fromTo(
							reveals.filter((item) => item !== name),
							{ autoAlpha: 0, y: 24 },
							{
								autoAlpha: 1,
								y: 0,
								duration: 0.9,
								ease: "swiss",
								stagger: 0.1,
							},
							1,
						);
					},
				);
		},
		{ scope: root },
	);
	return (
		<section
			ref={root}
			className="intro-hero page-grid min-h-svh w-full grid-rows-[1fr_auto] gap-y-8 pt-32 pb-8"
		>
			<h1
				ref={nameRef}
				data-reveal
				className="col-span-4 self-center text-right text-display-xl text-subtle md:col-span-7 md:col-start-6"
			>
				Wendell Terence Dador
			</h1>
			<div className="col-span-4 row-start-2 space-y-4">
				<p data-reveal className="text-heading-l">
					software engineer, 2027
				</p>
				<ul className="flex gap-2">
					{links.map(({ href, label, Icon }) => (
						<li key={label} data-reveal>
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
								className="flex size-12 items-center justify-center rounded-full border border-rule transition-colors duration-150 ease-swiss hover:bg-primary hover:text-primary-foreground"
							>
								<Icon size={24} aria-hidden />
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
