import 'dotenv/config';

const REACT_APP_USER_POOL_ID = process.env.REACT_APP_USER_POOL_ID;
if (!REACT_APP_USER_POOL_ID) {
  throw new Error('REACT_APP_USER_POOL_ID is a required environment variable');
}

const REACT_APP_CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
if (!REACT_APP_CLIENT_ID) {
  throw new Error('REACT_APP_CLIENT_ID is a required environment variable');
}

const VITE_SPOTIFY_CLIENT_ID = process.env.VITE_SPOTIFY_CLIENT_ID;
if (!VITE_SPOTIFY_CLIENT_ID) {
  throw new Error('VITE_SPOTIFY_CLIENT_ID is a required environment variable');
}

const VITE_REDIRECT_TARGET = process.env.VITE_REDIRECT_TARGET;
if (!VITE_REDIRECT_TARGET) {
  throw new Error('VITE_REDIRECT_TARGET is a required environment variable');
}

export default ({ config }) => ({
  ...config,
  extra: {
    userPoolId: REACT_APP_USER_POOL_ID,
    clientId: REACT_APP_CLIENT_ID,
    spotifyClientId: VITE_SPOTIFY_CLIENT_ID,
    spotifyRedirectUri: VITE_REDIRECT_TARGET,
  },
});
