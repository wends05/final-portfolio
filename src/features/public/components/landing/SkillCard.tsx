import type { LandingSkillsCard } from "../../public.types";

export default function SkillCard({ title, description }: LandingSkillsCard) {
	return (
		<div>
			<h2>{title}</h2>
			<p>{description}</p>
		</div>
	);
}
