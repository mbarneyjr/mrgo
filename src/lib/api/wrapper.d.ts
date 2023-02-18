import { Context, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2, APIGatewayProxyEventV2WithJWTAuthorizer } from 'aws-lambda'

export interface WrappedEvent extends Omit<APIGatewayProxyEventV2WithJWTAuthorizer, 'body'> {
  body?: string | number | boolean | object
}

export type UnrappedResponse = APIGatewayProxyResultV2 | string | number | boolean | object  | void

export type UnwrappedHandler = (event: WrappedEvent, context: Context) => Promise<UnrappedResponse>
export type LambdaHandler = (event: APIGatewayProxyEventV2WithJWTAuthorizer, context: Context) => Promise<APIGatewayProxyStructuredResultV2>

export function validateEvent(event: WrappedEvent): void
export function apiWrapper(handlerFunction: UnwrappedHandler): LambdaHandler
