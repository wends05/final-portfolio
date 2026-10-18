import { useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { usePickTransition } from "#/features/public/hooks/usePickTransition";
import type { LandingSkill } from "#/features/skills/skills.types";
import LandingSkillCard from "./LandingSkillCard";
import SeeMoreLink from "./SeeMoreLink";

interface LandingSkillsSectionProps {
	skills: LandingSkill[];
}

export default function LandingSkillsSection({
	skills,
}: LandingSkillsSectionProps) {
	const router = useRouter();
	const container = useRef<HTMLDivElement>(null);

	const [picking, setPicking] = useState<string | null>(null);

	usePickTransition({
		scope: container,
		picking,
		getTargets: (slug, q) => {
			const rows = q("[data-slug]");
			const picked = rows.find((row) => row.dataset.slug === slug);
			const wash = picked?.querySelector("[data-pick-wash]");
			if (!picked || !wash) return null;

			return {
				// The other rows, plus the header, "see more" and the picked row's
				// skills line (all data-pick-fade).
				others: [
					...rows.filter((row) => row !== picked),
					...q("[data-pick-fade]"),
				],
				wash,
				title: picked,
				borders: [picked],
			};
		},
		navigate: (slug) =>
			router.navigate({ to: "/skills/$slug", params: { slug } }),
		onCancel: () => setPicking(null),
	});

	return (
		<div className="page-grid min-h-svh pt-10 md:pt-20" ref={container}>
			<h2
				data-pick-fade
				className="col-span-full w-full text-start text-display-l md:col-span-4 md:row-span-2"
			>
				Top skills I have experience with
			</h2>
			<div className="col-span-full space-y-3 md:-col-start-7 md:row-span-3 md:row-start-2">
				{skills.length === 0 ? (
					<p className="border-t pt-6 text-lead text-muted-foreground">
						No skills up for display
					</p>
				) : (
					skills.map((skill) => (
						<LandingSkillCard
							key={skill.slug}
							skill={skill}
							onPick={setPicking}
						/>
					))
				)}
			</div>
			{/* Same link as the projects section's "see more". On phones it follows
			    the rows; from md it sits under the heading. It fades out with the
			    heading when a skill is picked. */}
			{skills.length > 0 && (
				<SeeMoreLink
					to="/skills"
					label="See more of my skills here"
					pickFade
					className="col-span-full mt-6 self-start justify-self-start md:col-span-4 md:col-start-1 md:row-start-3 md:mt-0"
				/>
			)}
		</div>
	);
}
