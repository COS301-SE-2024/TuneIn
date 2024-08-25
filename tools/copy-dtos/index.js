// Search the current directory for "*.dto.ts" files
// Copy them all to the "dist" directory
const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "../../backend/src");
const destDir = path.join(__dirname, "../../frontend/app/models/backend-dto");

const excludeDirs = ["node_modules", "dist"];
const ignoreFiles = [".DS_Store"];

const copyFilesToDist = (source, dist) => {
	fs.readdir(source, { withFileTypes: true }, (err, entries) => {
	  if (err) {
		console.error("Error reading directory:", err);
		return;
	  }

	  entries.forEach((entry) => {
		const sourcePath = path.join(source, entry.name);
		const distPath = path.join(dist, entry.name);

		if (entry.isDirectory()) {
		  if (!excludeDirs.includes(entry.name)) {
			copyFilesToDist(sourcePath, dist);
		  }
		} else if (entry.name.endsWith(".dto.ts") && !ignoreFiles.includes(entry.name)) {
		  fs.copyFile(sourcePath, distPath, (err) => {
			if (err) {
			  console.error("Error copying file:", err);
			  return;
			}
			console.log(`Copied ${entry.name} to ${dist}`);
		  });
		}
	  });
	});
  };
console.log("sourceDir", sourceDir);
console.log("destDir", destDir);
fs.mkdir(destDir, { recursive: true }, (err) => {
	if (err) {
	  console.error("Error creating dist directory:", err);
	  return;
	}
	console.log("Created dist directory.");
  });
copyFilesToDist(sourceDir, destDir);
