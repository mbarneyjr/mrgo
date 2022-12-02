const fs = require('fs');
const path = require('path');
const apiSchemaBuilder = require('api-schema-builder');

const errors = require('../errors');

const commonHeaders = {
};

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 */
async function parseEvent(event) {
  const parsedEvent = structuredClone(event);
  if (parsedEvent.isBase64Encoded) parsedEvent.body = Buffer.from(parsedEvent.body, 'base64').toString();
  if (parsedEvent.body) parsedEvent.body = await Promise.resolve(parsedEvent.body).then(JSON.parse).catch(() => parsedEvent.body);
  return parsedEvent;
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

/**
 * Wrap a lambda function, handling things like common headers and errors
 * @param {function(import('aws-lambda').APIGatewayProxyEventV2, import('aws-lambda').Context): Promise<import('aws-lambda').APIGatewayProxyResultV2 | Record<string, uknown>>} handlerFunction the lambda function to wrap
 * @returns {function(import('aws-lambda').APIGatewayProxyEventV2, import('aws-lambda').Context): Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
exports.apiWrapper = (handlerFunction) => {
  return async (event, context) => {
    /* eslint-disable-next-line no-console */
    console.log(`Event: ${JSON.stringify(event)}`);

    const spec = JSON.parse(fs.readFileSync(path.join(__dirname, '../../openapi.packaged.json')).toString());
    const schema = apiSchemaBuilder.buildSchemaSync(spec);
    const [requestedMethod, requestedPath] = event.routeKey.split(' ');
    // convert /thing/{thingId} to /thing/:thingId which is what the validator will use
    const formattedPath = requestedPath.split('{').join(':').split('}').join('');
    const schemaEndpoint = schema[formattedPath][requestedMethod.toLowerCase()];

    try {
      const parsedEvent = await parseEvent(event);
      const validParameters = schemaEndpoint.parameters.validate({
        query: event.queryStringParameters,
        headers: event.headers,
        path: event.pathParameters,
      });
      const validBody = schemaEndpoint.body ? schemaEndpoint.body.validate(parsedEvent.body) : true;
      if (!validParameters || !validBody) {
        throw new errors.ValidationError('invalid request', formatOpenapiValidationErrors(schemaEndpoint?.parameters?.errors, schemaEndpoint?.body?.errors));
      }

      const result = await handlerFunction(parsedEvent, context);
      if (result?.statusCode) {
        result.headers = {
          ...commonHeaders,
          ...result.headers,
        };
        return result;
      }
      return {
        statusCode: 200,
        headers: {
          ...commonHeaders,
        },
        body: result ? JSON.stringify(result) : undefined,
      };
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
