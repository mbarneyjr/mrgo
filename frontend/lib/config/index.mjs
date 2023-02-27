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
  colors: {
    primary: '#aaf',
    primaryHeavy: '#ccf',
    primaryLight: '#eef',
    secondary: '#aff',
    secondaryHeavy: '#cff',
    success: '#7f7',
    error: '#f77',
    background: '#fff',
    warn: '#afa',
    warnHeavy: '#cfc',
    danger: '#faa',
    dangerHeavy: '#fcc',
  },
};
