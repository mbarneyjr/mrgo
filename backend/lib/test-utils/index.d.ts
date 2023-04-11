import { APIGatewayProxyEventV2WithJWTAuthorizer, Context } from '@types/aws-lambda';

export function evaluatePathParameters(path: string, pathParameters?: Record<string, string>): string;

type LambdaEventOptions = {
  method: string
  path: string
  pathParameters?: Record<string, string>
  queryStringParameters?: Record<string, string>
  cookies?: Array<string>
  headers?: Record<string, string>
  body?: string
  isBase64Encoded?: boolean
  stageVariables?: Record<string, string>
  claims?: Record<string, string>
};
export function getApiGatewayLambdaEvent(options: LambdaEventOptions): APIGatewayProxyEventV2WithJWTAuthorizer;
export function getApiGatewayLambdaContext(options?: Context): Context;
