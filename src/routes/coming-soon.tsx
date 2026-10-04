import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import ComingSoonComponent from "#/features/public/components/ComingSoonComponent";
import IntroCurtain from "#/features/public/components/intro/IntroCurtain";
import { getSiteGate } from "#/features/site/site.functions";

export const Route = createFileRoute("/coming-soon")({
	beforeLoad: async () => {
		const { gated } = await getSiteGate();

		if (!gated) throw redirect({ to: "/" });
	},
	head: () => ({
		meta: [
			{
				name: "robots",
				content: "noindex",
			},
		],
	}),
	component: ComingSoonPage,
});

function ComingSoonPage() {
	const [introActive, setIntroActive] = useState(false);

	return (
		<>
			<IntroCurtain onActiveChange={setIntroActive} />
			<div inert={introActive} className="contents">
				<ComingSoonComponent />
			</div>
		</>
	);
}
