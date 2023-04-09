import querystring from 'node:querystring';

/** @type{import('./index.js').evaluatePathParameters} */
function evaluatePathParameters(path, pathParameters) {
  return path.split('/').map((element) => {
    if (element[0] === '{' && element.slice(-1) === '}') {
      const replacedPart = pathParameters?.[element.split('{').join('').split('}').join('')];
      if (replacedPart) return replacedPart;
    }
    return element;
  }).join('/');
}

/** @type {import('./index.js').getApiGatewayLambdaEvent} */
export function getApiGatewayLambdaEvent(options) {
  return {
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
          claims: options.claims ?? {
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
  };
}

/** @type {import('./index.js').getApiGatewayLambdaContext} */
export function getApiGatewayLambdaContext(options) {
  return {
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
    done: () => false,
    fail: () => false,
    succeed: () => false,
  };
}
