// required env variables
/*
    - EXPO_USER_POOL_ID
    - EXPO_CLIENT_ID
    - PERSONAL_EMAIL
    - PERSONAL_PASSWORD
*/

import dotenv from "dotenv";
dotenv.config();

import {
	CognitoUserPool,
	AuthenticationDetails,
	CognitoUser,
} from "amazon-cognito-identity-js";

const poolData = {
	UserPoolId: process.env.EXPO_USER_POOL_ID,
	ClientId: process.env.EXPO_CLIENT_ID,
};

console.log("UserPool.tsx: poolData", poolData);
let UserPool = new CognitoUserPool(poolData);

const userData = {
	Username: process.env.PERSONAL_EMAIL,
	Pool: UserPool,
};
const cognitoUser = new CognitoUser(userData);

const authenticationData = {
	Username: process.env.PERSONAL_EMAIL,
	Password: process.env.PERSONAL_PASSWORD,
};
const authenticationDetails = new AuthenticationDetails(authenticationData);
cognitoUser.authenticateUser(authenticationDetails, {
	onSuccess: function (result) {
		console.log("access token + " + result.getAccessToken().getJwtToken());

		console.log(
			"result.getAccessToken().decodePayload()",
			result.getAccessToken().decodePayload(),
		);

		fetch("http://localhost:3000/auth/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				token: result.getAccessToken().getJwtToken(),
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(
					"############################################################",
				);
				console.log("your auth token:", data);
				//localStorage.setItem("token", data.token);
				console.log(
					"############################################################",
				);
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	},
	onFailure: function (err) {
		console.error(err);
	},
});
