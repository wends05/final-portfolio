import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const checks = ["check", "lint:ds", "typecheck", "build"];
const results = [];

for (const check of checks) {
	console.log(`\nRunning ${check}`);
	const result = spawnSync("bun", ["--bun", "run", check], {
		cwd,
		stdio: "inherit",
	});
	if (result.error) console.error(result.error.message);
	results.push({
		check,
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
