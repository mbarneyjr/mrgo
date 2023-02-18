import enhance from '@enhance/ssr';

import elements from './elements/index.mjs';

import routerHandler from './lib/router/index.mjs';
import head from './head/index.mjs';
import { parseSession, writeSession } from './lib/session/index.mjs';

/** @type {import('./index.js').handler} */
export async function handler(event) {
  /* eslint-disable-next-line no-console */
  console.log(`Event: ${JSON.stringify(event)}`);

  const parsedEvent = structuredClone(event);
  if (parsedEvent.isBase64Encoded && parsedEvent.body) {
    parsedEvent.body = Buffer.from(parsedEvent.body, 'base64').toString();
  }
  const session = await parseSession(parsedEvent.cookies);

  const renderResult = await routerHandler(parsedEvent, session);

  const headHtml = head(parsedEvent, renderResult.state);
  const html = enhance({
    elements,
    initialState: {
      ...renderResult.state,
      session,
    },
  });
  const bodyHtml = renderResult.body ? html`${headHtml}${renderResult.body}` : undefined;

  const newSession = await writeSession(renderResult.session);

  /** @type {import('aws-lambda').APIGatewayProxyResultV2} */
  const result = {
    statusCode: renderResult.statusCode ?? 200,
    isBase64Encoded: renderResult.isBase64Decoded ?? false,
    headers: renderResult.headers ?? {},
    body: renderResult.isBase64Decoded ? renderResult.body : bodyHtml,
    cookies: newSession,
  };
  return result;
}
