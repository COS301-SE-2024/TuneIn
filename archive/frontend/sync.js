// move ../common/constants.ts to constants.ts
const fs = require("fs");
const path = require("path");

const CONSTANTS_PATH = path.resolve("../common/constants.ts");
fs.copyFileSync(CONSTANTS_PATH, path.resolve("constants.ts"));
