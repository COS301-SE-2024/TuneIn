import { Buffer } from "buffer";

function getAPIBase(): string {
	return "https://tunein.co.za:3000";
}

export const API_BASE_URL = getAPIBase();
export const API_BASE_NO_PORT = API_BASE_URL.replace(/:\d+$/, "");

export function bytesToBase64(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString("base64");
}
