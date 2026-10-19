import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	ArrowUpRightIcon,
	DownloadSimpleIcon,
	EnvelopeSimpleIcon,
	FileTextIcon,
	GithubLogoIcon,
	LinkedinLogoIcon,
} from "@phosphor-icons/react/ssr";
import { useEffect, useRef, useState } from "react";
import {
	CONTACT_LINKS,
	COPY_FEEDBACK_MS,
	type ContactLink,
	copyText,
	DEFAULT_EMAIL_ID,
	EMAILS,
	type EmailId,
	findEmail,
	mailtoHref,
	RESUME_FILENAME,
} from "#/features/public/utils/contact";
import { cn } from "#/lib/utils";
import CoverEdge from "./CoverEdge";

// Heading on the left, three link tiles and an email panel on the right
// (canvas "Contact C"). Tiles respond to tap and focus as well as hover.
export default function ContactSection() {
	return (
		// Slides over the pinned end text; CoverEdge dissolves it first.
		<div className="relative z-10 bg-background">
			<CoverEdge />
			<section
				aria-labelledby="contact-title"
				className="page-grid gap-y-12 pt-32 pb-40"
			>
				<h2
					id="contact-title"
					className="col-span-full text-display-l lg:col-span-5"
				>
					More of me
				</h2>
				<nav
					aria-label="Contact links"
					className="col-span-full grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4 lg:col-span-7 lg:col-start-6"
				>
					{CONTACT_LINKS.map((link) => (
						<ContactTile key={link.label} link={link} />
					))}
					<EmailPanel />
				</nav>
			</section>
		</div>
	);
}

// Each tile's centered icon: brand logos, and a plain sheet for the résumé.
const LINK_ICONS: Record<ContactLink["label"], Icon> = {
	LinkedIn: LinkedinLogoIcon,
	GitHub: GithubLogoIcon,
	Résumé: FileTextIcon,
};

function ContactTile({ link }: { link: ContactLink }) {
	const download = link.kind === "download";
	const ActionIcon = download ? DownloadSimpleIcon : ArrowUpRightIcon;
	const LinkIcon = LINK_ICONS[link.label];
	return (
		<a
			href={link.href}
			{...(download
				? { download: RESUME_FILENAME }
				: { target: "_blank", rel: "noopener noreferrer" })}
			className={cn(
				"group focus-ring flex min-h-30 flex-col justify-between gap-6 border border-rule p-4 transition-colors-scale duration-200 ease-swiss focus-visible:outline-offset-3 active:scale-98 sm:aspect-3/4 sm:p-5",
				download
					? "bg-primary text-primary-foreground"
					: "hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground",
			)}
		>
			<span className="flex items-start justify-between gap-2">
				<span
					className={cn(
						"type-label",
						download
							? "text-on-accent-muted"
							: "text-muted-foreground group-hover:text-on-accent-muted group-focus-visible:text-on-accent-muted",
					)}
				>
					{link.kicker}
				</span>
				<ActionIcon size={28} aria-hidden />
			</span>
			<span className="flex flex-1 items-center justify-center">
				<LinkIcon className="size-12 sm:size-16" aria-hidden />
			</span>
			<span className="flex flex-col gap-2">
				<span className="text-heading-l">{link.label}</span>
				<span
					className={cn(
						"type-meta wrap-anywhere",
						download
							? "text-on-accent-muted"
							: "text-muted-foreground group-hover:text-on-accent-muted group-focus-visible:text-on-accent-muted",
					)}
				>
					{link.meta}
				</span>
			</span>
		</a>
	);
}

function EmailPanel() {
	const [emailId, setEmailId] = useState<EmailId>(DEFAULT_EMAIL_ID);
	const [copied, setCopied] = useState(false);
	const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const email = findEmail(emailId);

	useEffect(() => () => clearTimeout(resetTimer.current), []);

	async function copy() {
		if (!(await copyText(email.address))) return;
		setCopied(true);
		clearTimeout(resetTimer.current);
		resetTimer.current = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
	}

	return (
		<div className="flex flex-col gap-6 border border-rule p-4 sm:col-span-3 sm:p-5">
			<div className="flex items-start justify-between gap-2">
				<span className="type-label text-muted-foreground">04 · email</span>
				<EnvelopeSimpleIcon size={28} aria-hidden />
			</div>
			<fieldset className="min-w-0">
				<legend className="sr-only">Which email address</legend>
				<div className="flex flex-wrap gap-2">
					{EMAILS.map((option) => (
						<label
							key={option.id}
							className="type-label relative inline-flex min-h-11 cursor-pointer items-center border border-rule px-4 transition-colors duration-150 ease-swiss has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:outline-2 has-focus-visible:outline-ring has-focus-visible:outline-offset-2"
						>
							<input
								type="radio"
								name="contact-email"
								value={option.id}
								checked={option.id === emailId}
								onChange={() => {
									setEmailId(option.id);
									setCopied(false);
								}}
								className="sr-only"
							/>
							{option.label}
						</label>
					))}
				</div>
			</fieldset>
			<a
				href={mailtoHref(email.address)}
				className="wrap-anywhere focus-ring w-fit text-heading-l hover:underline focus-visible:outline-offset-4"
			>
				{email.address}
			</a>
			<div className="flex flex-wrap items-center gap-2">
				<a
					href={mailtoHref(email.address)}
					className="type-label focus-ring inline-flex min-h-11 items-center gap-2 border border-rule bg-primary px-4 text-primary-foreground"
				>
					Write an email
					<ArrowRightIcon size={16} aria-hidden />
				</a>
				<button
					type="button"
					onClick={copy}
					className="type-label focus-ring inline-flex min-h-11 items-center border border-rule px-4 transition-colors duration-150 ease-swiss hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground"
				>
					{copied ? "Copied" : "Copy address"}
				</button>
				<span role="status" className="sr-only">
					{copied ? "Email address copied" : ""}
				</span>
			</div>
		</div>
	);
}
