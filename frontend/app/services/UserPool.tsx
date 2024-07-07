import { CognitoUserPool } from "amazon-cognito-identity-js";
// eslint-disable-next-line import/no-unresolved

const UserPoolId = process.env.AWS_COGNITO_USER_POOL_ID;
const ClientId = process.env.AWS_COGNITO_CLIENT_ID;

if (!UserPoolId) {
	throw new Error(
		"No user pool ID (AWS_COGNITO_USER_POOL_ID) provided in environment variables",
	);
}

if (!ClientId) {
	throw new Error(
		"No client ID (AWS_COGNITO_CLIENT_ID) provided in environment variables",
	);
}

const poolData = {
	UserPoolId: UserPoolId,
	ClientId: ClientId,
};

export default new CognitoUserPool(poolData);
