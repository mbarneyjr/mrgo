import fetch from 'node-fetch';

import { config } from '../config/index.mjs';

/** @type {import('./index.js').getTokens} */
export async function getTokens(event, authCode) {
  const response = await fetch(`${config.auth.baseUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: config.auth.clientId,
      scope: config.auth.scope,
      redirect_uri: `${config.appEndpoint}/oauth2/idresponse`,
      grant_type: 'authorization_code',
      code: authCode,
    }),
  });
  const body = /** @type {import('./index.js').TokenCodeResponse} */ (await response.json());
  if (response.status < 200 || 299 < response.status) {
    throw new Error(`failed to fetch tokens, ${body.error}`);
  }
  return body;
}

/** @type {import('./index.js').refreshTokens} */
export async function refreshTokens(refreshToken) {
  const response = await fetch(`${config.auth.baseUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: config.auth.clientId,
      scope: config.auth.scope,
    }),
  });
  const body = /** @type {import('./index.js').RefreshedTokenCodeResponse} */ (await response.json());
  if (response.status < 200 || 299 < response.status) {
    throw new Error(`failed to fetch tokens, ${body.error}`);
  }
  return body;
}
