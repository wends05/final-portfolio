import {
	GithubLogoIcon,
	type Icon,
	LinkedinLogoIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import {
	CONTACT_LINKS,
	type ContactLink,
	EMAILS,
	mailtoHref,
} from "#/features/public/utils/contact";

type SocialLink = Extract<ContactLink, { kind: "external" }>;

const SOCIAL_LINKS = CONTACT_LINKS.filter(
	(link): link is SocialLink => link.kind === "external",
);

// Keyed by label, so adding an external contact link without an icon fails
// typecheck instead of rendering an undefined component.
const SOCIAL_ICONS: Record<SocialLink["label"], Icon> = {
	GitHub: GithubLogoIcon,
	LinkedIn: LinkedinLogoIcon,
};

// The footer sits behind the page: its content is fixed to the viewport
// bottom and clipped to this box (footer-reveal), so scrolling the page up
// uncovers it. Fixed content never scrolls the page on focus, so bring the
// footer into view when a link inside it gets keyboard focus.
export default function Footer() {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		const footer = ref.current;
		if (!footer) return;
		const reveal = () => footer.scrollIntoView({ block: "end" });
		footer.addEventListener("focusin", reveal);
		return () => footer.removeEventListener("focusin", reveal);
	}, []);

	return (
		<footer
			ref={ref}
			className="footer-reveal bg-inverse text-inverse-foreground"
		>
			<div className="footer-reveal-content page-grid gap-y-4 pt-32 pb-12 md:pt-40 md:pb-20">
				<h3 className="col-span-3 -col-start-3 row-start-1 text-end text-display-m">
					Wendell Terence Dador
				</h3>
				<ul className="type-meta col-span-full pt-10">
					{EMAILS.map(({ id, address }) => (
						<li key={id}>
							<a href={mailtoHref(address)} className="hover:underline">
								{address}
							</a>
						</li>
					))}
				</ul>
				<div className="col-span-full flex gap-6">
					{SOCIAL_LINKS.map(({ label, href }) => {
						const SocialIcon = SOCIAL_ICONS[label];
						return (
							<a
								key={label}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
							>
								<SocialIcon size={24} aria-hidden />
							</a>
						);
					})}
				</div>
			</div>
		</footer>
	);
}
