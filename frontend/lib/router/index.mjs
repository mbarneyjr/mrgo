import Router from '@medley/router';

import staticAssetsHandler from '../../pages/static.mjs';
import redirectHandler from '../../pages/go/index.mjs';
import urlsHandler, { postUrlsHandler } from '../../pages/urls/index.mjs';
import createUrlHandler from '../../pages/create-url/index.mjs';
import urlHandler, { postUrlHandler } from '../../pages/urls/{id}/index.mjs';
import oauth2Handler from '../../pages/oauth2/idresponse/index.mjs';
import loginHandler from '../../pages/login/index.mjs';
import logoutHandler from '../../pages/logout/index.mjs';
import notFoundPage from '../../pages/404/index.mjs';
import internalServerErrorPage from '../../pages/500/index.mjs';
import homePageHandler from '../../pages/index.mjs';
import { errorJson, logger } from '../logger/index.mjs';

const router = new Router();

/** @type {import('./index.js').addRoute} */
export function addRoute(method, path, handler) {
  const store = router.register(path);
  store[method] = handler;
}

/** @type {import('./index.js').getRoute} */
function getRoute(method, path) {
  const route = router.find(path);
  if (route === null) return null;
  const handler = route.store[method];
  if (!handler) return null;
  return {
    params: route.params,
    handler,
  };
}

addRoute('GET', '/', homePageHandler);
addRoute('GET', '/go/:id', redirectHandler);
addRoute('GET', '/static/*', staticAssetsHandler);
addRoute('GET', '/urls', urlsHandler);
addRoute('GET', '/create-url', createUrlHandler);
addRoute('POST', '/urls', postUrlsHandler);
addRoute('GET', '/urls/:id', urlHandler);
addRoute('POST', '/urls/:id', postUrlHandler);
addRoute('GET', '/oauth2/idresponse', oauth2Handler);
addRoute('GET', '/login', loginHandler);
addRoute('GET', '/logout', logoutHandler);

/** @type {import('./index.js').routerHandler} */
export async function routerHandler(event, session) {
  const route = getRoute(event.requestContext.http.method, event.rawPath);
  if (!route) return notFoundPage(event, session);

  try {
    /* eslint-disable-next-line no-param-reassign */
    event.pathParameters = route.params;
    const renderResult = await route.handler(event, session);
    if (renderResult.statusCode !== 404) return renderResult;
    return notFoundPage(event, session);
  } catch (err) {
    logger.error('error rendering page', { error: errorJson(err) });
    return internalServerErrorPage(event, session);
  }
}
