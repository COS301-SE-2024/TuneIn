import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    clientId: process.env.REACT_APP_CLIENT_ID,
  },
});
