import { getUrl } from '../../lib/backend/index.mjs';

/** @type {import('../../lib/router/index.js').RenderFunction} */
export default async function render(event, session) {
  if (!event.pathParameters?.id) throw new Error('id pathParameter not given');
  const url = await getUrl(event.pathParameters.id);
  if (url === null) {
    return {
      session,
      statusCode: 404,
    };
  }
  return {
    headers: {
      'location': url.target,
      'content-type': 'text/html',
    },
    session,
    statusCode: 302,
  };
}
