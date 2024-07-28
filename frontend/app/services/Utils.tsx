import localhost from "react-native-localhost";
const _localhost: string = "10.32.211.255";
const USE_LOCAL_BACKEND_SERVER = true;

function getAPIBase(): string {
	if (!USE_LOCAL_BACKEND_SERVER) {
		//do something
	}
	console.log("Local IP Address: ", _localhost);
	return `http://${_localhost}:3000`;
}

function getLocalhost(): string {
	if (!USE_LOCAL_BACKEND_SERVER) {
		//do something
	}
	console.log("Local IP Address: ", _localhost);
	return `http://${_localhost}`;
}
export const API_BASE_URL = getAPIBase();
export const LOCALHOST = getLocalhost();
