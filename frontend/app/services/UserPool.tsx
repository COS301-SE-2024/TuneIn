import { CognitoUserPool } from "amazon-cognito-identity-js";
// eslint-disable-next-line import/no-unresolved
import { AWS_COGNITO_USER_POOL_ID, AWS_COGNITO_CLIENT_ID } from "@env";

if (!AWS_COGNITO_USER_POOL_ID) {
	throw new Error(
		"No user pool ID (AWS_COGNITO_USER_POOL_ID) provided in environment variables",
	);
}

if (!AWS_COGNITO_CLIENT_ID) {
	throw new Error(
		"No client ID (AWS_COGNITO_CLIENT_ID) provided in environment variables",
	);
}

console.log(AWS_COGNITO_USER_POOL_ID, AWS_COGNITO_CLIENT_ID);

const poolData = {
	UserPoolId: AWS_COGNITO_USER_POOL_ID,
	ClientId: AWS_COGNITO_CLIENT_ID,
};

export default new CognitoUserPool(poolData);
