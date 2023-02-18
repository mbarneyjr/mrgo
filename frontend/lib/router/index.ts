import { APIGatewayProxyEventV2 } from 'aws-lambda'
import { Session } from '../session';

export interface RenderResult {
  body?: string
  state?: object
  session: Session
  headers?: Record<string, string>
  isBase64Decoded?: boolean
  statusCode?: number
}

export type RenderFunction = (event: APIGatewayProxyEventV2, session: Session) => Promise<RenderResult>
