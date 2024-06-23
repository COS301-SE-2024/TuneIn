import { CognitoUserPool } from "amazon-cognito-identity-js";
import { EXPO_USER_POOL_ID, EXPO_CLIENT_ID } from "@env";

if (!EXPO_USER_POOL_ID) {
  throw new Error('No user pool ID (EXPO_USER_POOL_ID) provided in environment variables');
}

if (!EXPO_CLIENT_ID) {
  throw new Error('No client ID (EXPO_CLIENT_ID) provided in environment variables');
}

console.log( EXPO_USER_POOL_ID, EXPO_CLIENT_ID);

const poolData = {
  UserPoolId: EXPO_USER_POOL_ID,
  ClientId: EXPO_CLIENT_ID,
};


export default new CognitoUserPool(poolData);
