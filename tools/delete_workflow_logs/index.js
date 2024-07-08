//const { Octokit } = require("@octokit/rest");
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.GH_ACCESS_TOKEN);

// Initialize Octokit with your GitHub token
const octokit = new Octokit({
  auth: process.env.GH_ACCESS_TOKEN,
});

const owner = 'COS301-SE-2024';
const repo = 'TuneIn';
const workflow_id = '104177253'; // Use the workflow file name or workflow ID

async function listWorkflows() {
  try {
    // List all workflows in a repository
    const listWorkflowsResponse = await octokit.actions.listRepoWorkflows({
      owner,
      repo,
    });
    console.log(listWorkflowsResponse.data.workflows);
  } catch (error) {
    console.error('Error listing workflows:', error);
  }
}
listWorkflows();

async function deleteWorkflowRunLogs() {
  try {
    // List all workflow runs for a specific workflow
    const listWorkflowRunsResponse = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      workflow_id,
    });
	console.log(listWorkflowRunsResponse);

    const runs = listWorkflowRunsResponse.data.workflow_runs;

    console.log(`Found ${runs.length} runs. Deleting logs...`);

    // Delete logs for each run
    for (const run of runs) {
      await octokit.actions.deleteWorkflowRunLogs({
        owner,
        repo,
        run_id: run.id,
      });
      console.log(`Deleted logs for run ID: ${run.id}`);
    }
    console.log('Completed deleting logs for all runs.');
  } catch (error) {
    console.error('Error deleting workflow run logs:', error);
  }
}
deleteWorkflowRunLogs();
