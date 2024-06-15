const { execSync } = require('child_process');
const { engines } = require('./package.json');

const versionRequirements = [
  { name: 'node', currentVersion: process.version, requiredVersion: engines.node },
  { name: 'npm', currentVersion: execSync('npm --version').toString().trim(), requiredVersion: engines.npm }
];

versionRequirements.forEach(({ name, currentVersion, requiredVersion }) => {
  if (!currentVersion.includes(requiredVersion)) {
    console.error(`Required ${name} version: ${requiredVersion}, but found: ${currentVersion}.`);
    process.exit(1);
  }
});

console.log('Node and npm versions are as required.');