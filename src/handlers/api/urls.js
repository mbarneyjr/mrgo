const urlsLib = require('../../lib/data/urls');

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {import('aws-lambda').Context} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
/* eslint-disable no-unused-vars */
exports.listHandler = async (event, context) => {
  const urls = await urlsLib.listUrls();
  return {
    statusCode: 200,
    body: JSON.stringify({
      urls: urls.urls,
      nextToken: urls.nextToken,
    }),
  };
};

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {import('aws-lambda').Context} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
/* eslint-disable no-unused-vars */
exports.createHandler = async (event, context) => {
  const url = await urlsLib.createUrl();
  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
};

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {import('aws-lambda').Context} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
/* eslint-disable no-unused-vars */
exports.getHandler = async (event, context) => {
  const url = await urlsLib.getUrl();
  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
};

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {import('aws-lambda').Context} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
/* eslint-disable no-unused-vars */
exports.putHandler = async (event, context) => {
  const url = await urlsLib.putUrl();
  return {
    statusCode: 200,
    body: JSON.stringify(url),
  };
};

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {import('aws-lambda').Context} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
/* eslint-disable no-unused-vars */
exports.deleteHandler = async (event, context) => {
  await urlsLib.deleteUrl();
  return {
    statusCode: 200,
  };
};
