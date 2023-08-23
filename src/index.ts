import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import fs from "fs";

export async function run() {
	const token = getInput("gh-token");
	const jsonfilePath = getInput("jsonfile");
	console.log("Path to JSON file: ", jsonfilePath);

	let jsonContent;
	try {
		// Read and parse the content of the JSON file
		jsonContent = JSON.parse(fs.readFileSync(jsonfilePath, "utf8"));
		console.log("JSON content:", jsonContent);
	} catch (error) {
		setFailed(`Error reading JSON file at ${jsonfilePath}: ${error}`);
		return;
	}

	const octokit = getOctokit(token);
	const pullRequest = context.payload.pull_request;

	try {
		if (!pullRequest) {
			throw new Error("This action can only be run on Pull Requests");
		}

		await octokit.rest.issues.createComment({
			...context.repo,
			issue_number: pullRequest.number,
			body: JSON.stringify(jsonContent, null, 2), // format the JSON content with 2-space indentation for better readability
		});
	} catch (error) {
		setFailed("Execution exit");
	}
}

if (!process.env.JEST_WORKER_ID) {
	run();
}
