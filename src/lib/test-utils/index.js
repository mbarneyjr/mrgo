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
 * @returns {import('aws-lambda').APIGatewayProxyEventV2WithJWTAuthorizer}
 */
exports.getApiGatewayLambdaEvent = (options) => ({
  version: '2.0',
  routeKey: `${options.method} ${options.path}`,
  rawPath: evaluatePathParameters(options.path, options.pathParameters),
  rawQueryString: options.queryStringParameters !== undefined ? querystring.encode(options.queryStringParameters) : '',
  queryStringParameters: options.queryStringParameters,
  cookies: options.cookies,
  pathParameters: options.pathParameters,
  headers: options.headers !== undefined ? options.headers : {},
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
    authorizer: {
      integrationLatency: 10,
      principalId: 'principalId',
      jwt: {
        claims: {
          email: 'unit@test.com',
        },
        scopes: [],
      },
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

/**
 * @param {Partial<import('aws-lambda').Context>} [options] overrides to the default context
 * @returns {import('aws-lambda').Context}
 */
exports.getApiGatewayLambdaContext = (options) => ({
  awsRequestId: options?.awsRequestId !== undefined ? options.awsRequestId : 'unittest',
  callbackWaitsForEmptyEventLoop: options?.callbackWaitsForEmptyEventLoop !== undefined ? options.callbackWaitsForEmptyEventLoop : false,
  functionName: options?.functionName !== undefined ? options.functionName : '',
  functionVersion: options?.functionVersion !== undefined ? options.functionVersion : '',
  getRemainingTimeInMillis: options?.getRemainingTimeInMillis !== undefined ? options.getRemainingTimeInMillis : () => 1000,
  invokedFunctionArn: options?.invokedFunctionArn !== undefined ? options.invokedFunctionArn : '',
  logGroupName: options?.logGroupName !== undefined ? options.logGroupName : '',
  logStreamName: options?.logStreamName !== undefined ? options.logStreamName : '',
  memoryLimitInMB: options?.memoryLimitInMB !== undefined ? options.memoryLimitInMB : '',
  clientContext: options?.clientContext !== undefined ? options.clientContext : {
    env: {
      platformVersion: 'unittest',
      platform: 'unittest',
      make: 'unittest',
      model: 'unittest',
      locale: 'unittest',
    },
    client: {
      installationId: 'unittest',
      appTitle: 'unittest',
      appVersionName: 'unittest',
      appVersionCode: 'unittest',
      appPackageName: 'unittest',
    },
  },
  identity: options?.identity !== undefined ? options.identity : {
    cognitoIdentityId: 'unittest',
    cognitoIdentityPoolId: 'unittest',
  },
  done: options?.done !== undefined ? options.done : () => false,
  fail: options?.fail !== undefined ? options.fail : () => false,
  succeed: options?.succeed !== undefined ? options.succeed : () => false,
});
