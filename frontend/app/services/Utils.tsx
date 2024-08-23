import localhost from "react-native-localhost";
import { Buffer } from "buffer";
import { USE_PRODUCTION_SERVER } from "react-native-dotenv";

let shouldUseProductionServer: boolean = false;
if (USE_PRODUCTION_SERVER !== undefined && USE_PRODUCTION_SERVER === "true") {
	shouldUseProductionServer = true;
}

function getAPIBase(): string {
	if (!shouldUseProductionServer) {
		console.log("Using production API base URL");
		return "http://tunein.co.za:3000";
	}
	console.log("Local IP Address: ", localhost);
	return `http://${localhost}:3000`;
}

export const API_BASE_URL = getAPIBase();
export const API_BASE_NO_PORT = API_BASE_URL.replace(/:\d+$/, "");

export function bytesToBase64(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString("base64");
}
