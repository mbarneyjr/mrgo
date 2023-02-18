const { apiWrapper } = require('../../lib/api/wrapper');
const urlsLib = require('../../lib/data/urls');

exports.listHandler = apiWrapper(async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.email;
  if (typeof userId !== 'string') throw new Error(`Invalid email claim, it should be a string but is not, claims: ${JSON.stringify(claims)}`);
  const urls = await urlsLib.listUrls(userId, event.queryStringParameters?.nextToken);
  return {
    urls: urls.urls,
    nextToken: urls.nextToken,
  };
});

exports.createHandler = apiWrapper(async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.email;
  if (typeof userId !== 'string') throw new Error(`Invalid email claim, it should be a string but is not, claims: ${JSON.stringify(claims)}`);
  const urlCreateRequest = /** @type {import('../../lib/data/urls/index').UrlCreateRequest} */ (event.body);
  const url = await urlsLib.createUrl(urlCreateRequest, userId);
  return url;
});

exports.getHandler = apiWrapper(async (event) => {
  const url = await urlsLib.getUrl(/** @type {string} */ (event.pathParameters?.urlId));
  return url;
});

exports.putHandler = apiWrapper(async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.email;
  if (typeof userId !== 'string') throw new Error(`Invalid email claim, it should be a string but is not, claims: ${JSON.stringify(claims)}`);
  const urlUpdateRequest = /** @type {import('../../lib/data/urls/index').UrlUpdateRequest} */ (event.body);
  const url = await urlsLib.putUrl(urlUpdateRequest, /** @type {string} */ (event.pathParameters?.urlId), userId);
  return url;
});

exports.deleteHandler = apiWrapper(async (event) => {
  const claims = event.requestContext.authorizer.jwt.claims;
  const userId = claims.email;
  if (typeof userId !== 'string') throw new Error(`Invalid email claim, it should be a string but is not, claims: ${JSON.stringify(claims)}`);
  await urlsLib.deleteUrl(/** @type {string} */ (event.pathParameters?.urlId), userId);
});
