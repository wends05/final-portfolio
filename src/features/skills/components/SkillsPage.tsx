import { useRouter } from "@tanstack/react-router";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { usePickTransition } from "#/features/public/hooks/usePickTransition";
import { useAppGSAP } from "#/integrations/animations/gsap";
import {
	matchFullMotion,
	REDUCED_MOTION,
} from "#/integrations/animations/motion";
import type { SkillsPageSkillCategory } from "../skills.types";
import { splitPicked } from "../skills.utils";
import SkillCategoryItem from "./SkillCategoryItem";

// Matches the title's `duration-500` color transition in SkillCategoryItem.
const ACTIVATE_BEFORE_PICK_MS = 500;

interface SkillsPageProps {
	skillCategories: SkillsPageSkillCategory[];
}

export default function SkillsPage({ skillCategories }: SkillsPageProps) {
	const [active, setActive] = useState(0);
	const [picking, setPicking] = useState<string | null>(null);
	// Set in the click itself, before React renders: stopping Lenis for the
	// pick fires one more ScrollTrigger update that would move the highlight.
	const pickStarted = useRef(false);
	const activateFromScroll = (index: number) => {
		if (!pickStarted.current) setActive(index);
	};
	const activateTimer = useRef<number | undefined>(undefined);
	useEffect(() => () => window.clearTimeout(activateTimer.current), []);

	const pick = (slug: string, index: number) => {
		// A second click while the first pick runs would restart it.
		if (pickStarted.current) return;
		pickStarted.current = true;
		// With reduced motion nothing is gray, so there is no fade to wait for.
		if (index === active || window.matchMedia(REDUCED_MOTION).matches) {
			setPicking(slug);
			return;
		}
		// A gray item fades to ink first, so the wash crosses the dark title.
		setActive(index);
		activateTimer.current = window.setTimeout(
			() => setPicking(slug),
			ACTIVATE_BEFORE_PICK_MS,
		);
	};

	const root = useRef<HTMLElement>(null);

	const router = useRouter();

	useAppGSAP(
		() => {
			const rootEl = root.current;
			if (!rootEl) return;
			matchFullMotion(() => {
				const skillItems = rootEl.querySelectorAll("li[data-skill-item]");
				skillItems.forEach((li, i) => {
					ScrollTrigger.create({
						trigger: li,
						start: "top center",
						end: "bottom center",
						onEnter: () => activateFromScroll(i),
						onEnterBack: () => activateFromScroll(i),
					});
				});
			});
		},
		{
			scope: root,
			dependencies: [skillCategories.length],
		},
	);

	usePickTransition({
		scope: root,
		picking,
		getTargets: (slug, q) => {
			const { picked, rest } = splitPicked(q("[data-skill-item]"), slug);
			const title = picked?.querySelector<HTMLElement>("[data-pick-title]");
			const wash = title?.querySelector("[data-pick-wash]");
			const link = picked?.querySelector<HTMLElement>("a");
			if (!title || !wash || !link) return null;

			return {
				// The other items, plus the header and every item's details
				// (all data-pick-fade), so the picked title washes alone.
				others: [...rest, ...q("[data-pick-fade]")],
				wash,
				title,
				borders: [link],
			};
		},
		navigate: (slug) =>
			router.navigate({ to: "/skills/$slug", params: { slug } }),
		onCancel: () => {
			pickStarted.current = false;
			setPicking(null);
		},
	});

	return (
		<main
			className="page-grid items-start gap-y-8 pt-32 pb-24 md:gap-y-12"
			ref={root}
		>
			<header
				data-pick-fade
				className="col-span-full space-y-6 border-rule border-b pb-4"
			>
				<h1 className="text-display-xl">skills</h1>
				<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
					<p className="max-w-xl py-3">
						skills, knowledge, stacks, and tools that I have learned, are using,
						or are familiar to.
					</p>
					<p className="type-index shrink-0">{skillCategories.length} skills</p>
				</div>
			</header>
			{skillCategories.length === 0 ? (
				<p className="col-span-full text-muted-foreground">
					No skills published.
				</p>
			) : (
				<ul className="col-span-full grid auto-rows-fr grid-cols-subgrid gap-y-5">
					{skillCategories.map((skillCategory, idx) => (
						<SkillCategoryItem
							onPick={(slug) => pick(slug, idx)}
							key={skillCategory.id}
							skillCategory={skillCategory}
							active={idx === active}
							onActivate={() => setActive(idx)}
						/>
					))}
				</ul>
			)}
		</main>
	);
}
