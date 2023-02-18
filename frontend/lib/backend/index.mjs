import fetch from 'node-fetch';

import { config } from '../config/index.mjs';

/**
 * @param {string} urlId
 * @returns {Promise<import('../../../src/lib/data/urls/index.js').Url | null>}
 */
export async function getUrl(urlId) {
  const response = await fetch(`${config.apiEndpoint}/urls/${urlId}`);
  const body = /** @type {import('../../../src/lib/data/urls/index.js').Url} */ (await response.json());
  if (response.status < 200 || 299 < response.status) {
    /* eslint-disable-next-line no-console */
    console.error(`failed to get url: ${JSON.stringify(body)}`);
    if (response.status === 404) return null;
    throw new Error(`failed to get url, ${body}`);
  }
  return body;
}

/**
 * @param {string | undefined} nextToken
 * @param {import('../../lib/middleware/auth/index.js').LoggedInSession} session
 * @returns {Promise<{ error: import('./index.js').ErrorMessage, urls: Array<import('../../../src/lib/data/urls/index.js').Url>}>}
 */
export async function getUrls(nextToken, session) {
  /** @type {Record<string, string>} */
  const queryStringParameters = {};
  if (nextToken) queryStringParameters.nextToken = nextToken;

  const response = await fetch(`${config.apiEndpoint}/urls?${new URLSearchParams(queryStringParameters)}`, {
    headers: {
      Authorization: session.idToken,
    },
  });
  const body = /** @type {import('../../../src/lib/data/urls/index.js').UrlListResponse} */ (await response.json());
  if (response.status < 200 || 299 < response.status) {
    /* eslint-disable-next-line no-console */
    console.error(`failed to list urls: ${JSON.stringify(body)}`);
    // if user error // todo standardize on 4xx error response
    if (399 < response.status && response.status < 500) return { error: JSON.stringify(body), urls: [] };
    throw new Error(`failed to list urls, ${JSON.stringify(body)}`);
  }

  return {
    urls: body.urls,
    error: null,
  };
}

/**
 * @param {import('../../../src/lib/data/urls/index.js').UrlCreateRequest} urlCreateRequest
 * @param {import('../../lib/middleware/auth/index.js').LoggedInSession} session
 * @returns {Promise<{ error: import('./index.js').ErrorMessage, url: import('../../../src/lib/data/urls/index.js').UrlCreateResponse | null }>}
 */
export async function createUrl(urlCreateRequest, session) {
  const response = await fetch(`${config.apiEndpoint}/urls`, {
    method: 'POST',
    body: JSON.stringify({
      ...urlCreateRequest,
      method: undefined,
    }),
    headers: {
      Authorization: session.idToken,
    },
  });
  const body = /** @type {import('../../../src/lib/data/urls/index.js').UrlCreateResponse} */ (await response.json());
  if (response.status < 200 || 299 < response.status) {
    /* eslint-disable-next-line no-console */
    console.error(`failed to create url: ${JSON.stringify(body)}`);
    // if user error // todo standardize on 4xx error response
    if (399 < response.status && response.status < 500) return { url: null, error: JSON.stringify(body) };
    throw new Error(`failed to create url, ${JSON.stringify(body)}`);
  }
  return {
    url: body,
    error: null,
  };
}

/**
 * @param {string} urlId
 * @param {import('../../lib/middleware/auth/index.js').LoggedInSession} session
 * @returns {Promise<void>}
 */
export async function deleteUrl(urlId, session) {
  await fetch(`${config.apiEndpoint}/urls/${urlId}`, {
    method: 'DELETE',
    headers: {
      Authorization: session.idToken,
    },
  });
}
