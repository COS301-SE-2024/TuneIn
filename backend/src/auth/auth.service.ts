import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AuthService {
  private cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;

  constructor() {
    this.cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      region: 'af-south-1',
    });
  }

  async validateUser(username: string, password: string): Promise<any> {
    const params = {
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      ClientId: process.env.AWS_COGNITO_CLIENT_ID,
      UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    try {
      const authResponse = await this.cognitoIdentityServiceProvider.adminInitiateAuth(params).promise();
      if (authResponse.AuthenticationResult) {
        const user = await this.cognitoIdentityServiceProvider.adminGetUser({
          UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
          Username: username,
        }).promise();

        return {
          username: user.Username,
          attributes: user.UserAttributes,
          authenticationResult: authResponse.AuthenticationResult,
        };
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
