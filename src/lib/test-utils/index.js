const querystring = require('node:querystring');

function evaluatePathParameters(path, pathParameters) {
  return path.split('/').map((element) => {
    if (element[0] === '{' && element.slice(-1) === '}') {
      const replacedPart = pathParameters[element.split('{').join('').split('}').join('')];
      if (replacedPart) return replacedPart;
    }
    return element;
  }).join('/');
}

/**
 * @param {object} options
 * @param {string} options.method HTTP method
 * @param {string} options.path HTTP path with unevaluated pathParameters
 * @param {Record<string, string>} [options.pathParameters] Path parameters
 * @param {Record<string, string>} [options.queryStringParameters] Querystring parameters
 * @param {Array<string>} [options.cookies] Cookie strings
 * @param {Record<string, string>} [options.headers] Headers
 * @param {string} [options.body] body
 * @param {boolean} [options.isBase64Encoded] body
 * @param {Record<string, string>} [options.stageVariables] Headers
 * @returns {import('aws-lambda').APIGatewayProxyEventV2}
 */
exports.getApiGatewayLambdaEvent = (options) => ({
  version: '2.0',
  routeKey: `${options.method} ${options.path}`,
  rawPath: evaluatePathParameters(options.path, options.pathParameters),
  rawQueryString: options.queryStringParameters && querystring.encode(options.queryStringParameters),
  queryStringParameters: options.queryStringParameters,
  cookies: options.cookies,
  pathParameters: options.pathParameters,
  headers: options.headers,
  body: options.body,
  stageVariables: options.stageVariables,
  isBase64Encoded: Boolean(options.isBase64Encoded),
  requestContext: {
    accountId: '123456789012',
    apiId: '1234567890',
    http: {
      method: 'POST',
      path: evaluatePathParameters(options.path, options.pathParameters),
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'Custom User Agent String',
    },
    requestId: 'requestId',
    routeKey: `${options.method} ${options.path}`,
    stage: 'unittest',
    time: '2/Feb/2020:00:00:00 +0000',
    timeEpoch: 1580601600,
    domainName: 'localhost',
    domainPrefix: 'localhost',
  },
});
