const { apiWrapper } = require('../../lib/api/wrapper');
const urlsLib = require('../../lib/data/urls');

/* eslint-disable no-unused-vars */
exports.listHandler = apiWrapper(async (event, context) => {
  const urls = await urlsLib.listUrls('global-user', event.queryStringParameters?.nextToken);
  return {
    urls: urls.urls,
    nextToken: urls.nextToken,
  };
});

/* eslint-disable no-unused-vars */
exports.createHandler = apiWrapper(async (event, context) => {
  const urlCreateRequest = /** @type {import('../../lib/data/urls/index').UrlCreateRequest} */ (event.body);
  const url = await urlsLib.createUrl(urlCreateRequest, 'global-user');
  return url;
});

/* eslint-disable no-unused-vars */
exports.getHandler = apiWrapper(async (event, context) => {
  const url = await urlsLib.getUrl(/** @type {string} */ (event.pathParameters?.urlId), 'global-user');
  return url;
});

/* eslint-disable no-unused-vars */
exports.putHandler = apiWrapper(async (event, context) => {
  const urlUpdateRequest = /** @type {import('../../lib/data/urls/index').UrlUpdateRequest} */ (event.body);
  const url = await urlsLib.putUrl(urlUpdateRequest, /** @type {string} */ (event.pathParameters?.urlId), 'global-user');
  return url;
});

/* eslint-disable no-unused-vars */
exports.deleteHandler = apiWrapper(async (event, context) => {
  await urlsLib.deleteUrl(/** @type {string} */ (event.pathParameters?.urlId), 'global-user');
});
