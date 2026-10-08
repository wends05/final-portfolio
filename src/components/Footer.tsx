import { GithubLogoIcon } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";

const emails = ["cxnner05@gmail.com", "wendellterence.dador-23@cpu.edu.ph"];

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
				<p className="row-start-1 text-display-m">Wendell Terence Dador</p>
				<p className="row-start-2 text-heading-s text-inverse-muted">
					software engineer
				</p>
				<ul className="type-meta col-span-full pt-10">
					{emails.map((email) => (
						<li key={email}>
							<a href={`mailto:${email}`} className="hover:underline">
								{email}
							</a>
						</li>
					))}
				</ul>
				<a
					href="https://github.com/wends05"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					className="col-span-full w-fit"
				>
					<GithubLogoIcon size={24} aria-hidden />
				</a>
			</div>
		</footer>
	);
}
