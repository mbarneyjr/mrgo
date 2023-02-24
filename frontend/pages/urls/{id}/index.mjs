import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { decode, encode } from 'querystring';
import authMiddleware from '../../../lib/middleware/auth/index.mjs';
import { getUrl, updateUrl } from '../../../lib/backend/index.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('../../../lib/router/index.js').RenderFunction} */
const getUrlHandler = authMiddleware(async (event, session) => {
  const urlId = event.pathParameters?.id;
  if (!urlId) throw new Error('id pathParameter not found');
  const response = await getUrl(urlId);

  /** @type {string[]} */
  const errorMessages = [];
  if (event.queryStringParameters?.error) errorMessages.push(event.queryStringParameters.error);
  if ('error' in response) errorMessages.push(response.error);

  const url = 'result' in response ? response.result : null;

  return {
    body: readFileSync(`${dirname}/index.html`).toString(),
    headers: {
      'content-type': 'text/html',
    },
    state: {
      error: errorMessages.join(','),
      url,
      successfullyUpdatedUrl: event.queryStringParameters?.successfullyUpdatedUrl === 'true',
    },
    session,
  };
});

/**
 * @param {string} body
 * @returns {import('./index.js').UpdateUrlFormRequest}
 */
function parsePostUrlsBody(body) {
  try {
    return JSON.parse(body);
  } catch (err) {
    return JSON.parse(JSON.stringify(decode(body)));
  }
}

/** @type {import('../../../lib/router/index.js').RenderFunction} */
const postUrlHandler = authMiddleware(async (event, session) => {
  const urlId = event.pathParameters?.id;
  if (!urlId) throw new Error('id pathParameter not found');
  if (!event.body) throw new Error('body was not supplied');

  const postUrlsRequest = parsePostUrlsBody(event.body);

  const response = await updateUrl(urlId, postUrlsRequest, session);

  if ('error' in response) {
    return {
      statusCode: 302,
      headers: {
        location: `/urls?${new URLSearchParams({ error: response.error })}`,
      },
      session,
    };
  }

  return {
    statusCode: 302,
    headers: {
      location: `/urls/${urlId}?${encode({ successfullyUpdatedUrl: true })}`,
    },
    session,
  };
});

export default getUrlHandler;
export {
  postUrlHandler,
};
