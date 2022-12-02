const fs = require('fs');
const path = require('path');

const { apiWrapper } = require('../../lib/api/wrapper');
const urlsLib = require('../../lib/data/urls');

/* eslint-disable no-unused-vars */
exports.listHandler = apiWrapper(async (event, context) => {
  const urls = await urlsLib.listUrls('global-user', event.queryStringParameters?.nextToken);
  const spec = JSON.parse(fs.readFileSync(path.join(__dirname, '../../openapi.packaged.json')).toString());
  return {
    urls: urls.urls,
    nextToken: urls.nextToken,
  };
});

/* eslint-disable no-unused-vars */
exports.createHandler = apiWrapper(async (event, context) => {
  const url = await urlsLib.createUrl(event.body, 'global-user');
  return url;
});

/* eslint-disable no-unused-vars */
exports.getHandler = apiWrapper(async (event, context) => {
  const url = await urlsLib.getUrl(event.pathParameters?.urlId, 'global-user');
  return url;
});

/* eslint-disable no-unused-vars */
exports.putHandler = apiWrapper(async (event, context) => {
  const url = await urlsLib.putUrl(event.body, event.pathParameters?.urlId, 'global-user');
  return url;
});

/* eslint-disable no-unused-vars */
exports.deleteHandler = apiWrapper(async (event, context) => {
  await urlsLib.deleteUrl(event.pathParameters?.urlId, 'global-user');
});
