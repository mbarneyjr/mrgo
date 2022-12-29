import { APIGatewayProxyEventV2,  Context, APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda'

export interface WrappedEvent extends Omit<APIGatewayProxyEventV2, 'body'> {
  body?: string | number | boolean | object
}

export type UnrappedResponse = APIGatewayProxyResultV2 | string | number | boolean | object  | void

export type UnwrappedHandler = (event: WrappedEvent, context: Context) => Promise<UnrappedResponse>
export type LambdaHandler = (event: APIGatewayProxyEventV2, context: Context) => Promise<APIGatewayProxyStructuredResultV2>

export function validateEvent(event: WrappedEvent): void
export function apiWrapper(handlerFunction: UnwrappedHandler): LambdaHandler
