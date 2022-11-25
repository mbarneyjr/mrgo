const BaseError = require('../errors/base');

const commonHeaders = {
};

/**
 * Wrap a lambda function, handling things like common headers and errors
 * @param {function(import('aws-lambda').APIGatewayProxyEventV2, import('aws-lambda').Context): Promise<import('aws-lambda').APIGatewayProxyResultV2 | Record<string, uknown>>} handlerFunction the lambda function to wrap
 * @returns {function(import('aws-lambda').APIGatewayProxyEventV2, import('aws-lambda').Context): Promise<import('aws-lambda').APIGatewayProxyResultV2>}
 */
exports.apiWrapper = (handlerFunction) => {
  return async (event, context) => {
    try {
      const result = await handlerFunction(event, context);
      if (result.statusCode) {
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
        body: JSON.stringify(result),
      };
    } catch (err) {
      if (err instanceof BaseError) {
        return {
          statusCode: err.statusCode,
          headers: {
            ...commonHeaders,
          },
          body: JSON.stringify({
            message: err.message,
            code: err.code,
          }),
        };
      }
      return {
        statusCode: 500,
        headers: {
          ...commonHeaders,
        },
        body: JSON.stringify({
          message: 'unknown internal error',
          code: 'UNKNOWN_ERROR',
        }),
      };
    }
  };
};
