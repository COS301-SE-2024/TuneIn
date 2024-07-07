export function getAPIBaseURL(): string {
	/*
	console.log("Constants:", Constants);
	const uri = Constants?.expoConfig?.hostUri
		? Constants.expoConfig.hostUri.split(`:`).shift().concat(`:3000`)
		: `yourapi.com`;
	console.log(`API Base URL: http://${uri}`);
	return `http://${uri}`;
	*/
	return `http://localhost:3000`;
}
