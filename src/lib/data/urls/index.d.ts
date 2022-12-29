import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import ShortUniqueId from 'short-unique-id'

export interface Url {
  /** the ID of the URL (slug that's used to redirect) */
  id: string
  /** the user-defined name of the URL */
  name: string
  /** the user-defined description of the URL */
  description: string
  /** the target https URL to redirect to */
  target: string
  /** the status of the URL */
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
}

export interface UrlCreateRequest {
  /** the user-defined name of the URL */
  name?: string
  /** the user-defined description of the URL */
  description?: string
  /** the target https URL to redirect to */
  target: string
  /** the status of the URL */
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED'
}

export interface UrlCreateResponse {
  /** the ID of the URL (slug that's used to redirect) */
  id: string
  /** the user-defined name of the URL */
  name?: string
  /** the user-defined description of the URL */
  description?: string
  /** the target https URL to redirect to */
  target: string
  /** the status of the URL */
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED'
}

export interface UrlUpdateRequest {
  /** the user-defined name of the URL */
  name?: string | null
  /** the user-defined description of the URL */
  description?: string | null
  /** the target https URL to redirect to */
  target?: string | null
  /** the status of the URL */
  status?: Url['status'] | null
}

export const uuid: ShortUniqueId

export function dbc(): DynamoDBDocumentClient
export function listUrls(userId: string, nextToken?: string): Promise<{ urls: Array<Url>, nextToken?: string }>
export function createUrl(item: UrlCreateRequest, userId: string): Promise<UrlCreateResponse>
export function getUrl(urlId: string, userId: string): Promise<Url>
export function putUrl(urlUpdateRequest: UrlUpdateRequest, urlId: string, userId: string): Promise<Url>
export function deleteUrl(urlId: string, userId: string): Promise<void>
