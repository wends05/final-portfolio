import type { getTopSkills } from "#/features/skills/skills.server";
import type { LandingSkillsCard } from "../../public.types";
import SkillCard from "./SkillCard";

interface SkillsSectionProps {
	skills: Awaited<ReturnType<typeof getTopSkills>>;
	SkillCard: React.ComponentType<LandingSkillsCard>;
}

export default function SkillsSection({ skills }: SkillsSectionProps) {
	return (
		<div className="page-grid min-h-screen pt-10 md:pt-20">
			<h1 className="col-span-4 w-full text-start">
				Top skills I have experience with
			</h1>
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
