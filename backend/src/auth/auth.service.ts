import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;
  private userPoolId: string;
  private clientId: string;

  constructor(private configService: ConfigService) {
    this.cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider({
        region: 'af-south-1',
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      });
    this.userPoolId =
      this.configService.get<string>('AWS_COGNITO_USER_POOL_ID') || '';
    this.clientId =
      this.configService.get<string>('AWS_COGNITO_CLIENT_ID') || '';
  }

  async validateUser(username: string, password: string): Promise<any> {
    if (!this.userPoolId || !this.clientId) {
      throw new Error('Missing Cognito configuration');
    }

    const params: AWS.CognitoIdentityServiceProvider.AdminInitiateAuthRequest =
      {
        AuthFlow: 'ADMIN_NO_SRP_AUTH',
        ClientId: this.clientId,
        UserPoolId: this.userPoolId,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      };

    try {
      const authResponse = await this.cognitoIdentityServiceProvider
        .adminInitiateAuth(params)
        .promise();
      if (authResponse.AuthenticationResult) {
        const user = await this.cognitoIdentityServiceProvider
          .adminGetUser({
            UserPoolId: this.userPoolId,
            Username: username,
          })
          .promise();

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

  // eslint-disable-next-line prettier/prettier
  async listUsers(userSub: string): Promise<AWS.CognitoIdentityServiceProvider.ListUsersResponse> {
    const params = {
      UserPoolId: this.userPoolId,
    };

    try {
      const response = await this.cognitoIdentityServiceProvider
        .listUsers(params)
        .promise();
      return response;
    } catch (error) {
      throw new UnauthorizedException('Error listing users');
    }
  }
}
