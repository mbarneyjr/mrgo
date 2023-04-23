import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { decode } from 'querystring';
import authMiddleware from '../../lib/middleware/auth/index.mjs';
import { createUrl, deleteUrl, getUrls } from '../../lib/backend/index.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('../../lib/router/index.js').RenderFunction} */
const getUrlsHandler = authMiddleware(async (event, session) => {
  const response = await getUrls(event.queryStringParameters?.paginationToken, session);

  /** @type {string[]} */
  const errorMessages = [];
  if (event.queryStringParameters?.error) errorMessages.push(event.queryStringParameters.error);
  if ('error' in response) errorMessages.push(response.error);

  const urls = 'result' in response ? response.result.urls : [];
  const forwardPaginationToken = 'result' in response ? response.result.forwardPaginationToken : undefined;
  const backwardPaginationToken = 'result' in response ? response.result.backwardPaginationToken : undefined;

  return {
    body: readFileSync(`${dirname}/index.html`).toString(),
    headers: {
      'content-type': 'text/html',
    },
    state: {
      head: {
        title: 'Create Url',
        description: 'Create a url redirect',
      },
      error: errorMessages.join(','),
      urls,
      forwardPaginationToken,
      backwardPaginationToken,
    },
    session,
  };
});

/** @type {import('./index.js').parsePostUrlsBody} */
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
    // eslint-disable-next-line
    // @ts-ignore
    const response = await createUrl(postUrlsRequest, session);
    if ('error' in response) {
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
