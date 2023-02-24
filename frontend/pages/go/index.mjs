import { getUrl } from '../../lib/backend/index.mjs';

/** @type {import('../../lib/router/index.js').RenderFunction} */
export default async function render(event, session) {
  if (!event.pathParameters?.id) throw new Error('id pathParameter not given');
  const response = await getUrl(event.pathParameters.id);
  if ('error' in response) {
    return {
      session,
      statusCode: 404,
    };
  }
  return {
    headers: {
      'location': response.result.target,
      'content-type': 'text/html',
    },
    session,
    statusCode: 302,
  };
}
