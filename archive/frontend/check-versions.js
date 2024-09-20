const { execSync } = require("child_process");
const { engines } = require("./package.json");

const compareVersions = (currentVersion, requiredVersion) => {
	const current = currentVersion.split(".").map(Number);
	const required = requiredVersion.split(".").map(Number);

	for (let i = 0; i < required.length; i++) {
		if (current[i] < required[i]) return false;
		if (current[i] > required[i]) return true;
	}
	return true;
};

const versionRequirements = [
	{
		name: "node",
		currentVersion: process.version,
		requiredVersion: engines.node,
	},
	{
		name: "npm",
		currentVersion: execSync("npm --version").toString().trim(),
		requiredVersion: engines.npm,
	},
];

versionRequirements.forEach(({ name, currentVersion, requiredVersion }) => {
	if (!compareVersions(currentVersion, requiredVersion)) {
		console.error(
			`Required ${name} version: ${requiredVersion}, but found: ${currentVersion}. Use \`nvm use stable\` to switch to the correct version.`,
		);
		process.exit(1);
	} else {
		console.log(
			`Current ${name} version: ${currentVersion} matches the required version: ${requiredVersion}`,
		);
	}
});

console.log("Node and npm versions are as required.");
