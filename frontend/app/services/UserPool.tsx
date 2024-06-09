import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "af-south-1_vQS6mSsvu",
  ClientId: "3aml5h29pscdpipr5tauhjtp9k",
};

export default new CognitoUserPool(poolData);