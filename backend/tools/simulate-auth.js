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

		/*
		var myHeaders = new Headers();
		myHeaders.append("Content-Type", "application/json");
		myHeaders.append("Accept", "application/json");
		myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQxM2M2MjY4LTYwNTEtNzAyNC0yODA2LWY0NjI3NjA1ZGYwYiIsInVzZXJuYW1lIjoidGhlb3JpZ2luYWxsZXNAZ21haWwuY29tIiwiZW1haWwiOiJ0aGVvcmlnaW5hbGxlc0BnbWFpbC5jb20iLCJpYXQiOjE3MTgxMjU0MTUsImV4cCI6MTcxODEzMjYxNX0.Kf1FX1Qkkd-XBMHKG-BkUPTUHUc8pL5DREMeu3hvb0c");

		var raw = JSON.stringify({
		"token": "eyJraWQiOiI4dk41TDlBbWNmcnFlQnYwM292RFZMMW1iOHdLbjdrOHQrcGxEakhBYUxZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0MTNjNjI2OC02MDUxLTcwMjQtMjgwNi1mNDYyNzYwNWRmMGIiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYWYtc291dGgtMS5hbWF6b25hd3MuY29tXC9hZi1zb3V0aC0xX1lERGcwQ1JQRiIsImNsaWVudF9pZCI6IjNicDhmaTk1Z2gxbzN0OHN1NGl0bHJjdThrIiwib3JpZ2luX2p0aSI6ImYzOTMxNDQyLTRkOGUtNDEyMC1iZWEyLTE4MmU4OGFkZWY4MyIsImV2ZW50X2lkIjoiODZjMWYwM2EtMWQ4OS00NWIyLTljYzUtM2FkYWY4ZDc4YWUzIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTcxODEyNTMzMywiZXhwIjoxNzE4MTI4OTMzLCJpYXQiOjE3MTgxMjUzMzMsImp0aSI6ImNlNmFlYjg5LWI2M2YtNDZhYi05YmU0LTE4Mzk5MjIwYWU1YiIsInVzZXJuYW1lIjoiNDEzYzYyNjgtNjA1MS03MDI0LTI4MDYtZjQ2Mjc2MDVkZjBiIn0.uBGf1FeA9Fz7g4VuaIxR8TIxa-wuNSm4Nf-U5megJBpega24OONhgk8Firegijib8NqZENA9ZM_h73xKsHKi9PRkBCDxHd26uM3Ijy62iMy6zljTQCG7gPMOFbRRGaTEB1Hl6UsbTJoiz4KyBOX38Wf2NqYHov5OnvPeEzmrFLRiRNq0reqyftPLpftROUJa310NNjbp4v3SmSB45sJ6Bm0sUmZDOq6ktQ_KnEwFoJ0uz9Xv7CNStz0KlvMSFfGHqFNhX-cA1RdmFKOMBcB61zw9JDqjf5tiAxebguRm6Q7ffQeSBb3ONicPWGrrUcsBNMd2zc3pcWCADiq3gT5faA"
		});

		var requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw,
		redirect: 'follow'
		};

		fetch("http://localhost:3000/auth/login", requestOptions)
		.then(response => response.text())
		.then(result => console.log(result))
		.catch(error => console.log('error', error));
		*/
		//POST request to backend
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
