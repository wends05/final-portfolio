import { CaretRightIcon } from "@phosphor-icons/react/ssr";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

interface SeeMoreLinkProps {
	to: "/projects" | "/skills";
	label: string;
	className?: string;
	/** Fades out with the rest of the section when a list row is picked. */
	pickFade?: boolean;
}

export default function SeeMoreLink({
	to,
	label,
	className,
	pickFade,
}: SeeMoreLinkProps) {
	return (
		<Button
			nativeButton={false}
			variant="link"
			className={className}
			data-pick-fade={pickFade || undefined}
			render={
				<Link to={to} className="flex w-min items-center">
					<span>
						<CaretRightIcon />
					</span>
					<span className="text-xl">{label}</span>
				</Link>
			}
		/>
	);
}
