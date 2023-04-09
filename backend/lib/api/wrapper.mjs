import fs from 'fs';
import path from 'path';
import apiSchemaBuilder from 'api-schema-builder';
import * as errors from '../errors/index.mjs';
import { logger, errorJson } from '../logger/index.mjs';

/** @type {Record<string, string | number | boolean>} */
const commonHeaders = {
  'Access-Control-Allow-Origin': '*',
};

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2WithJWTAuthorizer} event
 * @returns {Promise<import('./wrapper.js').WrappedEvent>}
 */
async function parseEvent(event) {
  const parsedEvent = structuredClone(event);
  if (parsedEvent.body !== undefined) {
    const bodyString = parsedEvent.isBase64Encoded && typeof parsedEvent.body === 'string'
      ? Buffer.from(parsedEvent.body, 'base64').toString()
      : parsedEvent.body;
    parsedEvent.body = await Promise.resolve(bodyString).then(JSON.parse).catch(() => bodyString);
  }
  return parsedEvent;
}

/** @type {import('./wrapper.js').formatOpenapiValidationErrors} */
function formatOpenapiValidationErrors(parameterErrors, bodyErrors) {
  const formattedParameterErrors = parameterErrors?.map((parameterError) => {
    return {
      message: parameterError.message,
      dataPath: parameterError.dataPath,
      ...parameterError.params,
    };
  });

  const formattedBodyErrors = bodyErrors?.map((bodyError) => {
    const dataPath = bodyError.dataPath;
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

/** @type {import('./wrapper.js').validateEvent} */
export function validateEvent(event) {
  const spec = /** @type {import('api-schema-builder').OpenapiSpec} */ (JSON.parse(fs.readFileSync(path.join(__dirname, '../../openapi.packaged.json')).toString()));
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
    const validationErrors = formatOpenapiValidationErrors(schemaEndpoint?.parameters?.errors, schemaEndpoint?.body?.errors);
    const validationErrorMessage = validationErrors.map((validationError) => `${validationError.dataPath}: ${validationError.message}`).join('\n');
    throw new errors.ValidationError(validationErrorMessage, validationErrors);
  }
}

/** @type {import('./wrapper.js').apiWrapper} */
export function apiWrapper(handlerFunction, options) {
  return async (event, context) => {
    /* eslint-disable-next-line no-console */
    logger.info('event', { event });
    try {
      const parsedEvent = await parseEvent(event);
      if (options?.authorizeJwt === true) {
        const claims = event.requestContext?.authorizer?.jwt?.claims;
        const userId = claims.email;
        if (typeof userId !== 'string') {
          logger.error('Invalid email claim, it should be a string but is not, claims:', { claims });
          throw new errors.UnauthorizedError('Unauthorized');
        }
      }

      /** @type {import('./wrapper.js').validateEvent<object>} */
      validateEvent(parsedEvent);

      /** @type {import('./wrapper.js').ApiResponse} */
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
        lambdaResult.statusCode = result.statusCode ?? 200;
        lambdaResult.headers = {
          ...commonHeaders,
          ...result.headers,
        };
        lambdaResult.body = result.body;
        lambdaResult.cookies = result.cookies;
        lambdaResult.isBase64Encoded = result.isBase64Encoded;
      } else {
        lambdaResult.body = JSON.stringify(result);
        lambdaResult.headers['content-type'] = 'application/json';
      }
      return lambdaResult;
    } catch (err) {
      /* eslint-disable-next-line no-console */
      const errorLog = logger.error('error', { error: errorJson(err) });
      if (err instanceof errors.BaseError) {
        /** @type {import('./wrapper.js').ApiErrorResponseBody} */
        const errorResponseBody = {
          error: {
            message: err.message,
            code: err.code,
            body: err.body,
          },
        };
        return {
          statusCode: err.statusCode,
          headers: {
            ...commonHeaders,
          },
          body: JSON.stringify(errorResponseBody),
        };
      }
      const newError = new Error(JSON.stringify(errorLog), { cause: err });
      throw newError;
    }
  };
}
