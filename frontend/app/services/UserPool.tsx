import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "af-south-1_YDDg0CRPF",
  ClientId: "3bp8fi95gh1o3t8su4itlrcu8k",
};

export default new CognitoUserPool(poolData);