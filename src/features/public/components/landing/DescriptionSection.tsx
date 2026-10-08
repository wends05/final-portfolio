import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { FULL_MOTION, REDUCED_MOTION } from "../../lib/intro";

const paragraph1 =
	"I am a software engineer based in the Philippines. I create web applications and games, and random stuff. I spend some of my free time exploring new stacks and tools.";

const paragraph2 =
	"With high experience in scrum, and agentic development, I ensure that I create software with good quality while still being able to continually learn new things.";

export default function DescriptionSection() {
	const root = useRef(null);

	useAppGSAP(
		() => {
			const el = root.current;
			if (!el) return;

			const styles = getComputedStyle(el);

			const from = styles.getPropertyValue("--text-subtle").trim();
			const to = styles.getPropertyValue("--text").trim();

			appGSAP
				.matchMedia()
				.add(
					{ motion: FULL_MOTION, reduce: REDUCED_MOTION },
					({ conditions }) => {
						if (conditions?.reduce) return;

						const items = appGSAP.utils.toArray<HTMLElement>("p", el);
						for (const p of items) {
							const { words } = SplitText.create(p, {
								type: "words",
								tag: "span",
							});

							appGSAP.fromTo(
								words,
								{ color: from },
								{
									color: to,
									ease: "none",
									stagger: 0.15,
									scrollTrigger: {
										trigger: p,
										start: "top 85%", // starts as it enters
										end: "bottom 45%", // fully inked before it passes center
										scrub: true,
									},
								},
							);
						}
					},
				);
		},
		{
			scope: root,
		},
	);
	return (
		<section ref={root} className="page-grid h-[50vh] min-h-100 w-full">
			{[paragraph1, paragraph2].map((paragraph, i) => (
				<p
					// biome-ignore lint/suspicious/noArrayIndexKey: static paragraphs
					key={i}
					// SplitText sets display:inline-block on words, which breaks
					// text-justify spacing; only color animates, so keep them inline.
					className="[&>span]:inline! col-span-4 self-center text-justify indent-span-4 font-normal text-heading-l md:col-span-8 md:col-start-5 md:indent-span-8"
				>
					{paragraph}
				</p>
			))}
		</section>
	);
}
