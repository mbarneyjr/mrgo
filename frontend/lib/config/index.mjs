export const config = {
  auth: {
    clientId: `${process.env.APP_CLIENT_ID}`,
    scope: 'openid email',
    baseUrl: `${process.env.AUTH_BASE_URL}`,
  },
  api: {
    pageSize: 10,
  },
  apiEndpoint: `${process.env.API_ENDPOINT}`,
  appEndpoint: `${process.env.APP_ENDPOINT}`,
};
