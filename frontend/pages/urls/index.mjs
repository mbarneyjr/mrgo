import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { decode } from 'querystring';
import authMiddleware from '../../lib/middleware/auth/index.mjs';
import { createUrl, deleteUrl, getUrls } from '../../lib/backend/index.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('../../lib/router/index.js').RenderFunction} */
const getUrlsHandler = authMiddleware(async (event, session) => {
  const response = await getUrls(event.queryStringParameters?.nextToken, session);
  return {
    body: readFileSync(`${dirname}/index.html`).toString(),
    headers: {
      'content-type': 'text/html',
    },
    state: {
      error: event.queryStringParameters?.error || response.error,
      urls: response.urls,
    },
    session,
  };
});

/**
 * @param {string} body
 * @returns {import('./index.js').CreateUrlFormRequest | import('./index.js').DeleteUrlFormRequest}
 */
function parsePostUrlsBody(body) {
  try {
    return JSON.parse(body);
  } catch (err) {
    return JSON.parse(JSON.stringify(decode(body)));
  }
}

/** @type {import('../../lib/router/index.js').RenderFunction} */
const postUrlsHandler = authMiddleware(async (event, session) => {
  if (!event.body) throw new Error('body was not supplied');

  const postUrlsRequest = parsePostUrlsBody(event.body);

  if (postUrlsRequest.method === 'create') {
    const response = await createUrl(postUrlsRequest, session);
    if (response.error) {
      return {
        statusCode: 302,
        headers: {
          location: `/urls?${new URLSearchParams({ error: response.error })}`,
        },
        session,
      };
    }
  } else {
    await deleteUrl(postUrlsRequest.id, session);
  }

  return {
    statusCode: 302,
    headers: {
      location: '/urls',
    },
    session,
  };
});

export default getUrlsHandler;
export {
  postUrlsHandler,
};
