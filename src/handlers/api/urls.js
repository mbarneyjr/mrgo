const { apiWrapper } = require('../../lib/api/wrapper');
const urlsLib = require('../../lib/data/urls');
const errors = require('../../lib/errors');

/* eslint-disable no-unused-vars */
exports.listHandler = apiWrapper(async (event, context) => {
  const urls = await urlsLib.listUrls();
  return {
    statusCode: 200,
    body: JSON.stringify({
      urls: urls.urls,
      nextToken: urls.nextToken,
    }),
  };
});

/* eslint-disable no-unused-vars */
exports.createHandler = apiWrapper(async (event, context) => {
  const url = await urlsLib.createUrl();
  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
});

/* eslint-disable no-unused-vars */
exports.getHandler = apiWrapper(async (event, context) => {
  if (event?.pathParameters?.urlId === 'notfound') throw new errors.NotFoundError('the requested url is not found');
  const url = await urlsLib.getUrl();
  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
});

/* eslint-disable no-unused-vars */
exports.putHandler = apiWrapper(async (event, context) => {
  const url = await urlsLib.putUrl();
  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
});

/* eslint-disable no-unused-vars */
exports.deleteHandler = apiWrapper(async (event, context) => {
  await urlsLib.deleteUrl();
  return {
    statusCode: 200,
  };
});
