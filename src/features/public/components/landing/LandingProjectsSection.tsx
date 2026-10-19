import { useRouter } from "@tanstack/react-router";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type CSSProperties, useRef, useState } from "react";
import RollingText from "#/components/RollingText";
import type { LandingProject } from "#/features/projects/projects.types";
import { usePickTransition } from "#/features/public/hooks/usePickTransition";
import { getPresentationState } from "#/features/public/utils/presentation";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import CoverEdge from "./CoverEdge";
import LandingProjectCard from "./LandingProjectCard";
import SeeMoreLink from "./SeeMoreLink";

interface LandingProjectsSectionProps {
	projects: LandingProject[];
}

export default function LandingProjectsSection({
	projects: items,
}: LandingProjectsSectionProps) {
	const [active, setActive] = useState(0);
	const lastActive = useRef(0);
	const track = useRef<HTMLDivElement>(null);
	const bar = useRef<HTMLSpanElement>(null);
	const stage = useRef<HTMLDivElement>(null);
	const router = useRouter();
	// Slug of the project whose "Read more" was clicked.
	const [picking, setPicking] = useState<string | null>(null);
	// Set in the click itself, before React renders: stopping Lenis fires one
	// more ScrollTrigger update with a bogus progress that would swap the card.
	const pickStarted = useRef(false);
	const pick = (slug: string) => {
		pickStarted.current = true;
		setPicking(slug);
	};

	useAppGSAP(
		() => {
			// No track to pin while nothing is featured.
			if (items.length === 0) return;
			ScrollTrigger.create({
				trigger: track.current,
				start: "top top",
				end: "bottom bottom",
				onUpdate: (self) => {
					if (pickStarted.current) return;
					const next = getPresentationState(self.progress, items.length);

					if (next.active !== lastActive.current) {
						lastActive.current = next.active;
						setActive(next.active);
					}
					appGSAP.set(bar.current, { "--bar": next.barProgress });
				},
			});
		},
		{
			scope: track,
			dependencies: [items.length],
		},
	);

	usePickTransition({
		scope: stage,
		picking,
		getTargets: (slug, q) => {
			const picked = q("article[data-slug]").find(
				(card) => card.dataset.slug === slug,
			);
			const title = picked?.querySelector<HTMLElement>("[data-pick-title]");
			const wash = title?.querySelector("[data-pick-wash]");
			if (!title || !wash) return null;

			return { others: q("[data-pick-fade]"), wash, title };
		},
		navigate: (slug) =>
			router.navigate({ to: "/projects/$slug", params: { slug } }),
		onCancel: () => {
			pickStarted.current = false;
			setPicking(null);
		},
	});

	return (
		<div className="relative z-10 bg-background">
			<CoverEdge />
			<section aria-labelledby="landing-projects-title">
				<h2
					id="landing-projects-title"
					className="px-4 text-center text-display-l"
				>
					<RollingText text="SOME OF MY WORKS" />
				</h2>
				{items.length === 0 ? (
					// A screen tall at least: the pinned description above stays under
					// this section for its last screen of scroll (--pinned-cover).
					<div className="page-grid content-center py-24 motion-safe:min-h-svh md:py-32">
						<p className="col-span-full text-center text-lead text-muted-foreground">
							No projects up for display
						</p>
					</div>
				) : (
					<div
						className="relative"
						ref={track}
						style={{
							height: `${(items.length + 0.5) * 100}svh`,
						}}
					>
						{/* Full-screen stage from md, where the image row fills it. On phones
					    the card is shorter, so the stage fits it and "See more" follows
					    the last project instead of a screen's worth of empty stage. */}
						<div
							ref={stage}
							className="page-grid sticky top-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-y-6 overflow-hidden pt-24 pb-8 md:h-svh md:pt-32 md:pb-10"
						>
							<div
								data-pick-fade
								role="progressbar"
								aria-label="Progress through this project"
								className="col-span-full h-0.5 w-1/3 md:absolute md:top-1/2 md:right-6 md:h-[33svh] md:w-0.5 md:-translate-y-1/2"
							>
								<span className="block size-full bg-border">
									<span
										ref={bar}
										// Empty until ScrollTrigger's first update sets --bar.
										style={{ "--bar": 0 } as CSSProperties}
										className="block size-full origin-top-left scale-x-(--bar) bg-foreground md:scale-x-100 md:scale-y-(--bar)"
									/>
								</span>
							</div>
							{items.map((project, i) => (
								<LandingProjectCard
									key={project.slug}
									project={project}
									active={i === active}
									onPick={pick}
								/>
							))}
						</div>
					</div>
				)}
				{items.length > 0 && (
					<div className="page-grid">
						<SeeMoreLink
							to="/projects"
							label="See more of my projects here"
							className="col-span-full md:col-span-4 md:col-start-8"
						/>
					</div>
				)}
			</section>
		</div>
	);
}
