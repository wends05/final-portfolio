import { spawnSync } from "node:child_process";
import { delimiter } from "node:path";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
// `onNode` checks run on Node.js, matching production (ADR 0005, ADR 0010).
const checks = [
	{ name: "check" },
	{ name: "lint:ds" },
	{ name: "typecheck" },
	{ name: "test", onNode: true },
	{ name: "build" },
];
const results = [];

// `bun --bun` puts a `node` shim on PATH; drop it so `node` means Node.js.
const nodeEnv = {
	...process.env,
	PATH: (process.env.PATH ?? "")
		.split(delimiter)
		.filter((dir) => !dir.includes("bun-node"))
		.join(delimiter),
};

for (const { name, onNode } of checks) {
	console.log(`\nRunning ${name}`);
	const result = spawnSync(
		"bun",
		onNode ? ["run", name] : ["--bun", "run", name],
		{
			cwd,
			stdio: "inherit",
			env: onNode ? nodeEnv : process.env,
		},
	);
	if (result.error) console.error(result.error.message);
	results.push({
		check: name,
		passed: !result.error && result.status === 0,
		detail: result.error
			? "could not start"
			: result.signal
				? `signal ${result.signal}`
				: `exit ${result.status}`,
	});
	if (result.signal === "SIGINT" || result.signal === "SIGTERM") {
		process.exit(result.signal === "SIGINT" ? 130 : 143);
	}
}

console.log("\nVerification results");
for (const { check, passed, detail } of results) {
	console.log(`${passed ? "PASS" : "FAIL"} ${check} (${detail})`);
}
process.exitCode = results.every(({ passed }) => passed) ? 0 : 1;
