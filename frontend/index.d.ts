import { APIGatewayProxyEventV2, Context, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyStructuredResultV2>
