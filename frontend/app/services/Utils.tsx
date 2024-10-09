import localhost from "react-native-localhost";
import { Buffer } from "buffer";
import { USE_PRODUCTION_SERVER } from "react-native-dotenv";

const shouldUseProductionServer =
	USE_PRODUCTION_SERVER &&
	JSON.parse(USE_PRODUCTION_SERVER.toLowerCase()) === true;
console.log(`USE_PRODUCTION_SERVER: `, USE_PRODUCTION_SERVER);
console.log(`shouldUseProductionServer: `, shouldUseProductionServer);

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
