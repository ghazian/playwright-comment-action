import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import fs from "fs";

export async function run() {
	const core = require("@actions/core");
	const token = getInput("gh-token");
	const jsonfile = core.getInput("jsonfile");
	const stringify = JSON.stringify(jsonfile);

	const octokit = getOctokit(token);
	const pullRequest = context.payload.pull_request;

	try {
		if (!pullRequest) {
			throw new Error("This action can only be run on Pull Requests");
		}

		// const jsonContent = JSON.parse(fs.readFileSync(jsonfile, "utf8"));

		await octokit.rest.issues.createComment({
			...context.repo,
			issue_number: pullRequest.number,
			body: stringify,
		});
	} catch (error) {
		setFailed((error as Error)?.message ?? "Unknown error");
	}
}

if (!process.env.JEST_WORKER_ID) {
	run();
}
