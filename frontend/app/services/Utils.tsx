import localhost from "react-native-localhost";
import { Buffer } from "buffer";
import { USE_PRODUCTION_SERVER } from "react-native-dotenv";

console.log("USE_PRODUCTION_SERVER: ", USE_PRODUCTION_SERVER);
let shouldUseProductionServer: boolean = true;
if (USE_PRODUCTION_SERVER !== undefined && USE_PRODUCTION_SERVER === "false") {
	shouldUseProductionServer = false;
}

function getAPIBase(): string {
	if (shouldUseProductionServer) {
		console.log("Using production API base URL");
		return "https://tunein.co.za:3000";
	}
	console.log("Local IP Address: ", localhost);
	return `http://${localhost}:3000`;
}

export const API_BASE_URL = getAPIBase();
export const API_BASE_NO_PORT = API_BASE_URL.replace(/:\d+$/, "");

export function bytesToBase64(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString("base64");
}
