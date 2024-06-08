import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "af-south-1_2EtY2dFJO",
  ClientId: "1ma6da9ktcaq6sc8v08r66bovr",
};

export default new CognitoUserPool(poolData);