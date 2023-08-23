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

		// Search for a comment posted by GitHub Actions bot (assuming the bot's login is "github-actions[bot]")
		const botComment = comments.data.find(
			(comment) => comment?.user?.login === "github-actions[bot]"
		);

		const bodyContent = JSON.stringify(jsonContent, null, 2); // formatted JSON content

		if (botComment) {
			// If the bot has already commented, update the comment
			await octokit.rest.issues.updateComment({
				...context.repo,
				comment_id: botComment.id,
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
