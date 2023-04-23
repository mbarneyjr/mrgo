if (!process.env.APP_CLIENT_ID) {
  throw new Error('APP_CLIENT_ID is not defined');
}
if (!process.env.AUTH_BASE_URL) {
  throw new Error('AUTH_BASE_URL is not defined');
}
if (!process.env.API_ENDPOINT) {
  throw new Error('API_ENDPOINT is not defined');
}
if (!process.env.APP_ENDPOINT) {
  throw new Error('APP_ENDPOINT is not defined');
}

export const config = {
  auth: {
    clientId: process.env.APP_CLIENT_ID,
    scope: 'openid email',
    baseUrl: process.env.AUTH_BASE_URL,
  },
  api: {
    pageSize: 10,
  },
  apiEndpoint: process.env.API_ENDPOINT,
  appEndpoint: process.env.APP_ENDPOINT,
  /** @type {import('./index.js').ColorConfig} */
  colors: {
    nav: {
      light: '#808080',
      normal: '#333333',
      heavy: '#2C2C2C',
    },
    background: {
      light: '#FFFFFF',
      normal: '#F3F3F3',
      heavy: '#E5E5E5',
    },
    primary: {
      light: '#4E9171',
      normal: '#3D8060',
      heavy: '#2C7050',
    },
    success: {
      light: '#4589B7',
      normal: '#3478C6',
      heavy: '#2367B5',
    },
    danger: {
      light: '#CB584F',
      normal: '#BA473E',
      heavy: '#A9362D',
    },
  },
};
