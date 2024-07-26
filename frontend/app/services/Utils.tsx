import localhost from "react-native-localhost";

const USE_LOCAL_BACKEND_SERVER = true;

function getAPIBase(): string {
	if (!USE_LOCAL_BACKEND_SERVER) {
		//do something
	}
	console.log("Local IP Address: ", localhost);
	return `http://${localhost}:3000`;
}

function getLocalhost(): string {
	if (!USE_LOCAL_BACKEND_SERVER) {
		//do something
	}
	console.log("Local IP Address: ", localhost);
	return `http://${localhost}`;
}
export const API_BASE_URL = getAPIBase();
export const LOCALHOST = getLocalhost();
