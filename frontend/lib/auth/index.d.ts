import { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface TokenCodeResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  error?: any
}

export type RefreshedTokenCodeResponse = Omit<TokenCodeResponse, 'refresh_token'>;

export function getTokens(event: APIGatewayProxyEventV2, authCode: string): Promise<TokenCodeResponse>;
export function refreshTokens(refreshToken: string): Promise<RefreshedTokenCodeResponse>;
