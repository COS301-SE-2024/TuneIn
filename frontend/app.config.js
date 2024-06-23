import 'dotenv/config';

const AWS_COGNITO_USER_POOL_ID = process.env.AWS_COGNITO_USER_POOL_ID;
if (!AWS_COGNITO_USER_POOL_ID) {
  throw new Error('AWS_COGNITO_USER_POOL_ID is a required environment variable');
}

const AWS_COGNITO_CLIENT_ID = process.env.AWS_COGNITO_CLIENT_ID;
if (!AWS_COGNITO_CLIENT_ID) {
  throw new Error('AWS_COGNITO_CLIENT_ID is a required environment variable');
}

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
if (!SPOTIFY_CLIENT_ID) {
  throw new Error('SPOTIFY_CLIENT_ID is a required environment variable');
}

const SPOTIFY_REDIRECT_TARGET = process.env.SPOTIFY_REDIRECT_TARGET;
if (!SPOTIFY_REDIRECT_TARGET) {
  throw new Error('SPOTIFY_REDIRECT_TARGET is a required environment variable');
}

export default ({ config }) => ({
  ...config,
  extra: {
    userPoolId: AWS_COGNITO_USER_POOL_ID,
    clientId: AWS_COGNITO_CLIENT_ID,
    spotifyClientId: SPOTIFY_CLIENT_ID,
    spotifyRedirectUri: SPOTIFY_REDIRECT_TARGET,
  },
});
