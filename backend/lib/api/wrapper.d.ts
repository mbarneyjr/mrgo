import {
  Context,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
} from '@types/aws-lambda';

import {
  ParameterValidationError,
  BodyValidationError,
} from 'api-schema-builder';

export interface ApiWrapperOptions {
  authorizeJwt?: boolean
}

export interface ValidationError extends Record<string, string> {
  message: string
  dataPath: string
}

export interface ApiResponse extends APIGatewayProxyStructuredResultV2 {
  headers: Record<string, string | number | boolean>
}

export interface ApiErrorResponseBody {
  error: {
    message: string
    code: string
    body?: Record<string, unknown>
  }
}

export function formatOpenapiValidationErrors(parameterErrors: Array<ParameterValidationError>, bodyErrors: Array<BodyValidationError>): Array<ValidationError>

export interface WrappedEvent extends Omit<APIGatewayProxyEventV2WithJWTAuthorizer, 'body'> {
  body?: string | number | boolean | object
}

export type UnrappedResponse = APIGatewayProxyResultV2 | string | number | boolean | object | void;

export type UnwrappedHandler = (event: WrappedEvent, context: Context) => Promise<UnrappedResponse>
export type LambdaHandler = (event: APIGatewayProxyEventV2WithJWTAuthorizer, context: Context) => Promise<APIGatewayProxyStructuredResultV2>

export function validateEvent(event: WrappedEvent): void
export function apiWrapper(handlerFunction: UnwrappedHandler, options?: ApiWrapperOptions): LambdaHandler
