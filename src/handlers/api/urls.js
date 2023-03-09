const { apiWrapper } = require('../../lib/api/wrapper');
const urlsLib = require('../../lib/data/urls');

exports.listHandler = apiWrapper(async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.email;
  const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters?.limit, 10) : 10;
  const paginationToken = event.queryStringParameters?.paginationToken;
  const urls = await urlsLib.listUrls(/** @type {string} */ (userId), limit, paginationToken);
  return {
    urls: urls.urls,
    forwardPaginationToken: urls.forwardPaginationToken,
    backwardPaginationToken: urls.backwardPaginationToken,
  };
}, { authorizeJwt: true });

exports.createHandler = apiWrapper(async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.email;
  const urlCreateRequest = /** @type {import('../../lib/data/urls/index').UrlCreateRequest} */ (event.body);
  const url = await urlsLib.createUrl(urlCreateRequest, /** @type {string} */ (userId));
  return url;
}, { authorizeJwt: true });

exports.getHandler = apiWrapper(async (event) => {
  const url = await urlsLib.getUrl(/** @type {string} */ (event.pathParameters?.urlId));
  return url;
});

exports.putHandler = apiWrapper(async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.email;
  const urlUpdateRequest = /** @type {import('../../lib/data/urls/index').UrlUpdateRequest} */ (event.body);
  const url = await urlsLib.putUrl(urlUpdateRequest, /** @type {string} */ (event.pathParameters?.urlId), /** @type {string} */ (userId));
  return url;
}, { authorizeJwt: true });

exports.deleteHandler = apiWrapper(async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.email;
  await urlsLib.deleteUrl(/** @type {string} */ (event.pathParameters?.urlId), /** @type {string} */ (userId));
}, { authorizeJwt: true });
