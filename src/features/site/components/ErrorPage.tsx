import { Link, useLocation } from "@tanstack/react-router";
import {
	type ErrorPageAction,
	type ErrorPageKind,
	getErrorPageCopy,
	getSafeErrorDetail,
} from "#/features/site/site.utils";
import { cn } from "#/lib/utils";

interface ErrorPageProps {
	errorKind: ErrorPageKind;
	error?: unknown;
	/** Re-runs the failed page; retry actions render only when it is set. */
	onRetry?: () => void;
	/**
	 * Rendered outside the public layout (an error in the root or the layout
	 * itself), so there is no Navbar: draw the wordmark here instead.
	 */
	standalone?: boolean;
}

const actionBase =
	"type-label flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 border px-4 focus-ring transition-colors duration-150 ease-swiss";

const actionStyles = {
	primary: cn(
		actionBase,
		"border-primary bg-primary text-primary-foreground hover:bg-background hover:text-foreground",
	),
	secondary: cn(
		actionBase,
		"border-rule bg-transparent hover:bg-primary hover:text-primary-foreground",
	),
};

export default function ErrorPage({
	errorKind,
	error,
	onRetry,
	standalone = false,
}: ErrorPageProps) {
	const copy = getErrorPageCopy(errorKind);
	const detail = getSafeErrorDetail(error);
	const { pathname } = useLocation();

	return (
		<div className="relative flex min-h-svh flex-col justify-between gap-16 pt-32 pb-12">
			{/* React hoists this into <head>, keeping error pages out of search. */}
			<meta name="robots" content="noindex" />
			{standalone && (
				<header className="page-grid absolute inset-x-0 top-0 py-4 md:py-5">
					<Link
						to="/"
						aria-label="wends.dev, home"
						className="focus-ring col-span-full w-fit font-semibold text-heading-s leading-11 tracking-tight"
					>
						wends.dev
					</Link>
				</header>
			)}

			{/* w-full: page-grid's auto margins would shrink a flex item. */}
			<div className="page-grid w-full">
				<p className="type-label col-span-full text-muted-foreground">
					{copy.label}
				</p>
			</div>

			<div className="space-y-8">
				<div className="page-grid">
					<h1 className="col-span-full text-display-xl md:col-span-11">
						{copy.message}
					</h1>
				</div>

				<div className="page-grid gap-y-6">
					<div className="col-span-full border-rule border-t" />
					<p className="type-meta wrap-break-word col-span-full text-muted-foreground md:col-span-3">
						{copy.code} · {pathname}
					</p>
					<div className="col-span-full flex flex-col gap-4 md:col-span-4 md:col-start-5">
						<p>{copy.details}</p>
						{detail && (
							<div className="border-rule-soft border-t pt-3">
								<p className="type-label mb-2 text-muted-foreground">
									Development only
								</p>
								<pre className="type-meta wrap-break-word whitespace-pre-wrap">
									{detail}
								</pre>
							</div>
						)}
					</div>
					<div className="col-span-full flex flex-col gap-2 md:col-span-3 md:col-start-10">
						<ErrorPageButton
							action={copy.primary}
							className={actionStyles.primary}
							onRetry={onRetry}
						/>
						<ErrorPageButton
							action={copy.secondary}
							className={actionStyles.secondary}
							onRetry={onRetry}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

function ErrorPageButton({
	action,
	className,
	onRetry,
}: {
	action: ErrorPageAction;
	className: string;
	onRetry?: () => void;
}) {
	const content = (
		<>
			{action.label} <span aria-hidden>→</span>
		</>
	);

	if (action.type === "link") {
		return (
			<Link to={action.to} className={className}>
				{content}
			</Link>
		);
	}

	if (!onRetry) return null;

	return (
		<button type="button" onClick={onRetry} className={className}>
			{content}
		</button>
	);
}
