import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import ComingSoonComponent from "#/features/public/components/ComingSoonComponent";
import IntroCurtain from "#/features/public/components/intro/IntroCurtain";
import { buildSeo, DEFAULT_DESCRIPTION } from "#/features/seo/seo.utils";
import { getSiteGate } from "#/features/site/site.functions";

export const Route = createFileRoute("/coming-soon")({
	beforeLoad: async () => {
		const { gated } = await getSiteGate();

		if (!gated) throw redirect({ to: "/" });
	},
	head: () =>
		buildSeo({
			title: "coming soon",
			description: DEFAULT_DESCRIPTION,
			noindex: true,
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
