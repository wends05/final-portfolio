import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Link } from "@tanstack/react-router";
import { isPlainClick } from "#/features/public/utils/pick";
import type { LandingSkill } from "#/features/skills/skills.types";
import WashText from "./WashText";

interface LandingSkillCardProps {
	skill: LandingSkill;
	/** Starts the pick animation; the section navigates when it ends. */
	onPick: (slug: string) => void;
}

const VISIBLE_TOOLS_COUNT = 3;

export default function LandingSkillCard({
	skill,
	onPick,
}: LandingSkillCardProps) {
	const visibleTools = skill.tools.slice(0, VISIBLE_TOOLS_COUNT);
	const otherToolsLength = skill.tools.length - VISIBLE_TOOLS_COUNT;
	return (
		<Link
			data-slug={skill.slug}
			to="/skills/$slug"
			params={{ slug: skill.slug }}
			className="focus-ring flex flex-row justify-between gap-6 border-t last:border-b"
			onClick={(e) => {
				if (!isPlainClick(e)) return;
				e.preventDefault();
				onPick(skill.slug);
			}}
		>
			<div className="flex flex-col gap-3 pt-6 pb-3">
				<h3>
					<WashText className="text-display-m">{skill.name}</WashText>
				</h3>

				<span data-pick-fade className="type-meta">
					{visibleTools.map(({ name }) => name).join(" · ")}
					{otherToolsLength > 0 && (
						<span className="font-label"> +{otherToolsLength} more</span>
					)}
				</span>
			</div>
			<div className="content-center">
				<ArrowRightIcon />
			</div>
		</Link>
	);
}
