import { ApiGatewayProxyEventV2 } from '@types/aws-lambda';
import { StateBase } from '../lib/router/index';

export function Head(event: ApiGatewayProxyEventV2, state: StateBase): string;
