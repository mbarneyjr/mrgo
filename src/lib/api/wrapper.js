const fs = require('fs');
const path = require('path');
const apiSchemaBuilder = require('api-schema-builder');

const errors = require('../errors');

/** @type {Record<string, string>} */
const commonHeaders = {
  'Access-Control-Allow-Origin': '*',
};

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2WithJWTAuthorizer} event
 * @returns {Promise<import('./wrapper').WrappedEvent>}
 */
async function parseEvent(event) {
  const parsedEvent = structuredClone(event);
  const bodyString = parsedEvent.isBase64Encoded && typeof parsedEvent.body === 'string' ? Buffer.from(parsedEvent.body, 'base64').toString() : parsedEvent.body;
  const parsedBody = await Promise.resolve(bodyString).then(JSON.parse).catch(() => bodyString);
  return {
    ...parsedEvent,
    body: parsedBody,
  };
}

/**
 * @param {Array | undefined} parameterErrors
 * @param {Array | undefined} bodyErrors
 * @returns {Array}
 */
function formatOpenapiValidationErrors(parameterErrors, bodyErrors) {
  const formattedParameterErrors = parameterErrors?.map((parameterError) => {
    return {
      message: parameterError.message,
      dataPath: parameterError.dataPath,
      ...parameterError.params,
    };
  });

  const formattedBodyErrors = bodyErrors?.map((bodyError) => {
    const dataPath = `body${bodyError.dataPath}`;
    return {
      message: bodyError.message,
      dataPath,
      ...bodyError.params,
    };
  });

  return [
    ...(formattedParameterErrors || []),
    ...(formattedBodyErrors || []),
  ];
}

/** @type {import('./wrapper').validateEvent} */
exports.validateEvent = (event) => {
  const spec = JSON.parse(fs.readFileSync(path.join(__dirname, '../../openapi.packaged.json')).toString());
  const schema = apiSchemaBuilder.buildSchemaSync(spec);
  const [requestedMethod, requestedPath] = event.routeKey.split(' ');
  // convert /thing/{thingId} to /thing/:thingId which is what the validator will use
  const formattedPath = requestedPath.split('{').join(':').split('}').join('');
  const schemaEndpoint = schema[formattedPath][requestedMethod.toLowerCase()];
  const validParameters = schemaEndpoint.parameters.validate({
    query: event.queryStringParameters,
    headers: event.headers,
    path: event.pathParameters,
  });
  const validBody = schemaEndpoint.body ? schemaEndpoint.body.validate(event.body) : true;
  if (!validParameters || !validBody) {
    throw new errors.ValidationError('invalid request', formatOpenapiValidationErrors(schemaEndpoint?.parameters?.errors, schemaEndpoint?.body?.errors));
  }
};

/** @type {import('./wrapper').apiWrapper} */
exports.apiWrapper = (handlerFunction) => {
  return async (event, context) => {
    /* eslint-disable-next-line no-console */
    console.log(`Event: ${JSON.stringify(event)}`);

    try {
      const parsedEvent = await parseEvent(event);
      /** @type {import('./wrapper').validateEvent<object>} */
      exports.validateEvent(parsedEvent);

      /** @type {import('aws-lambda').APIGatewayProxyResultV2} */
      const lambdaResult = {
        statusCode: 200,
        headers: commonHeaders,
      };
      const result = await handlerFunction(parsedEvent, context);
      if (typeof result === 'string' || typeof result === 'number' || typeof result === 'boolean') {
        lambdaResult.body = `${result}`;
      } else if (result === undefined) {
        lambdaResult.body = 'OK';
      } else if (result instanceof Object && 'statusCode' in result) {
        lambdaResult.statusCode = result.statusCode;
        lambdaResult.headers = {
          ...commonHeaders,
          ...result.headers,
        };
        lambdaResult.body = result.body;
        lambdaResult.cookies = result.cookies;
        lambdaResult.isBase64Encoded = result.isBase64Encoded;
      } else {
        lambdaResult.body = JSON.stringify(result);
      }
      return lambdaResult;
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
      if (err instanceof errors.BaseError) {
        return {
          statusCode: err.statusCode,
          headers: {
            ...commonHeaders,
          },
          body: JSON.stringify({
            message: err.message,
            code: err.code,
            error: err.body,
          }),
        };
      }
      throw err;
    }
  };
};
