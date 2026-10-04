import type { getTopSkills } from "#/features/skills/skills.server";
import type { LandingSkillsCard } from "../../public.types";
import SkillCard from "./SkillCard";

interface SkillsSectionProps {
	skills: Awaited<ReturnType<typeof getTopSkills>>;
	SkillCard: React.ComponentType<LandingSkillsCard>;
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
	return (
		<div>
			Hello world
			{skills.map((skill) => (
				<SkillCard
					key={skill.id}
					title={skill.name}
					description={skill.overview}
				/>
			))}
		</div>
	);
}
