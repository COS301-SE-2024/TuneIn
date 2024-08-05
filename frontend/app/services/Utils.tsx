import localhost from "react-native-localhost";
import { Buffer } from "buffer";

const USE_LOCAL_BACKEND_SERVER = true;

function getAPIBase(): string {
	if (!USE_LOCAL_BACKEND_SERVER) {
		//do something
	}
	console.log("Local IP Address: ", localhost);
	return `http://172.16.11.44:3000`;
}

function getLocalhost(): string {
	if (!USE_LOCAL_BACKEND_SERVER) {
		//do something
	}
	console.log("Local IP Address: ", localhost);
	return `http://172.16.11.44`;
}
export const API_BASE_URL = getAPIBase();
export const LOCALHOST = getLocalhost();

export function bytesToBase64(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString("base64");
}
