import { CognitoUserPool } from "amazon-cognito-identity-js";
import { EXPO_USER_POOL_ID, EXPO_CLIENT_ID } from "@env";

const poolData = {
  UserPoolId: EXPO_USER_POOL_ID,
  ClientId: EXPO_CLIENT_ID,
};
console.log(EXPO_CLIENT_ID, EXPO_USER_POOL_ID);

export default new CognitoUserPool(poolData);
