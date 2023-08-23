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

		// Fetch all comments of the PR
		const comments = await octokit.rest.issues.listComments({
			...context.repo,
			issue_number: pullRequest.number,
		});

		// Search for a comment that contains "Playwright Test Report from Actions"
		const targetComment = comments.data.find((comment) =>
			comment?.body?.includes("Playwright Test Report from Actions")
		);

		const bodyContent =
			"Playwright Test Report from Actions\n\n" +
			JSON.stringify(jsonContent, null, 2); // prefix with the identifier and then the formatted JSON content

		if (targetComment) {
			// If the targeted comment exists, update it
			await octokit.rest.issues.updateComment({
				...context.repo,
				comment_id: targetComment.id,
				body: bodyContent,
			});
		} else {
			// Otherwise, create a new comment
			await octokit.rest.issues.createComment({
				...context.repo,
				issue_number: pullRequest.number,
				body: bodyContent,
			});
		}
	} catch (error) {
		setFailed("Execution exit");
	}
}

if (!process.env.JEST_WORKER_ID) {
	run();
}
