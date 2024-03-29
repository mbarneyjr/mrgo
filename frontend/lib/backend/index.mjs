import fetch from 'node-fetch';

import { config } from '../config/index.mjs';
import { logger } from '../logger/index.mjs';

/** @type {import('./index.js').getUrl} */
export async function getUrl(urlId) {
  const response = await fetch(`${config.apiEndpoint}/urls/${urlId}`);
  const body = /** @type {import('../../../backend/lib/data/urls/index.js').Url} */ (await response.json());
  if (response.status < 200 || 299 < response.status) {
    const errorLog = logger.error('failed to get url', { error: body });
    if (response.status === 404) return { error: 'URL not found' };
    throw new Error(JSON.stringify(errorLog));
  }
  return {
    result: body,
  };
}

/** @type {import('./index.js').getUrls} */
export async function getUrls(paginationToken, session) {
  logger.debug('getting urls', { paginationToken });
  /** @type {Record<string, string>} */
  const queryStringParameters = {
    limit: config.api.pageSize.toString(),
  };
  if (paginationToken) queryStringParameters.paginationToken = paginationToken;

  const response = await fetch(`${config.apiEndpoint}/urls?${new URLSearchParams(queryStringParameters)}`, {
    headers: {
      Authorization: session.idToken,
    },
  });

  if (response.status < 200 || 299 < response.status) {
    const errorResponse = /** @type {import('./index.js').ApiErrorResponseBody} */ (await response.json());
    const errorLog = logger.error('failed to list urls', { error: errorResponse });
    if (399 < response.status && response.status < 500) return { error: errorResponse.error.message };
    throw new Error(JSON.stringify(errorLog));
  }
  const body = /** @type {import('../../../backend/lib/data/urls/index.js').UrlListResponse} */ (await response.json());

  logger.debug('response', { urls: body.urls.length, forward: body.forwardPaginationToken, backward: body.backwardPaginationToken });
  return {
    result: {
      urls: body.urls,
      forwardPaginationToken: body.forwardPaginationToken,
      backwardPaginationToken: body.backwardPaginationToken,
    },
  };
}

/** @type {import('./index.js').updateUrl} */
export async function updateUrl(urlId, updateRequest, session) {
  const response = await fetch(`${config.apiEndpoint}/urls/${urlId}`, {
    method: 'PUT',
    body: JSON.stringify(updateRequest),
    headers: {
      Authorization: session.idToken,
    },
  });
  const body = /** @type {import('../../../backend/lib/data/urls/index.js').Url} */ (await response.json());
  if (response.status < 200 || 299 < response.status) {
    const errorLog = logger.error('failed to update url', { error: body });
    throw new Error(JSON.stringify(errorLog));
  }
  return {
    result: body,
  };
}

/** @type {import('./index.js').createUrl} */
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
  if (response.status < 200 || 299 < response.status) {
    const errorResponse = /** @type {import('./index.js').ApiErrorResponseBody} */ (await response.json());
    const errorLog = logger.error('failed to create url', { error: errorResponse });
    if (399 < response.status && response.status < 500) return { error: errorResponse.error.message };
    throw new Error(JSON.stringify(errorLog));
  }
  const body = /** @type {import('../../../backend/lib/data/urls/index.js').UrlCreateResponse} */ (await response.json());
  return {
    result: body,
  };
}

/** @type {import('./index.js').deleteUrl} */
export async function deleteUrl(urlId, session) {
  await fetch(`${config.apiEndpoint}/urls/${urlId}`, {
    method: 'DELETE',
    headers: {
      Authorization: session.idToken,
    },
  });
}
