import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Link } from "@tanstack/react-router";
import { isPlainClick } from "#/features/public/utils/pick";
import type { LandingSkillCategory } from "#/features/skills/skills.types";
import WashText from "./WashText";

interface LandingSkillCardProps {
	skillCategory: LandingSkillCategory;
	/** Starts the pick animation; the section navigates when it ends. */
	onPick: (slug: string) => void;
}

const VISIBLE_SKILLS_COUNT = 3;

export default function LandingSkillCard({
	skillCategory,
	onPick,
}: LandingSkillCardProps) {
	const visibleSkills = skillCategory.skills.slice(0, VISIBLE_SKILLS_COUNT);
	const otherSkillsLength = skillCategory.skills.length - VISIBLE_SKILLS_COUNT;
	return (
		<Link
			data-slug={skillCategory.slug}
			to="/skills/$slug"
			params={{ slug: skillCategory.slug }}
			className="flex flex-row justify-between gap-6 border-t last:border-b focus-ring"
			onClick={(e) => {
				if (!isPlainClick(e)) return;
				e.preventDefault();
				onPick(skillCategory.slug);
			}}
		>
			<div className="flex flex-col gap-3 pt-6 pb-3">
				<h3>
					<WashText className="text-display-m">{skillCategory.name}</WashText>
				</h3>

				<span data-pick-fade className="type-meta">
					{visibleSkills.map(({ name }) => name).join(" · ")}
					{otherSkillsLength > 0 && (
						<span className="font-label"> +{otherSkillsLength} more</span>
					)}
				</span>
			</div>
			<div className="content-center">
				<ArrowRightIcon />
			</div>
		</Link>
	);
}
