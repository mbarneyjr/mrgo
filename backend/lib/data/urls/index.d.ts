import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import ShortUniqueId from 'short-unique-id';

export interface UrlTableRecord extends Record<string, unknown> {
  /** the id of the url record */
  id: string
  /** the user ID */
  userId: string
}

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

export type Direction = 'forward' | 'backward';

export interface UrlListResponse {
  /** a list of urls */
  urls: Array<Url>
  forwardPaginationToken?: string
  backwardPaginationToken?: string
}

export const uuid: ShortUniqueId;

export function makeKey(record: UrlTableRecord): UrlTableRecord
export function dbc(): DynamoDBDocumentClient
export function listUrls(userId: string, limit: number, paginationToken?: string): Promise<UrlListResponse>
export function createUrl(item: UrlCreateRequest, userId: string): Promise<UrlCreateResponse>
export function getUrl(urlId: string): Promise<Url>
export function putUrl(urlUpdateRequest: UrlUpdateRequest, urlId: string, userId: string): Promise<Url>
export function deleteUrl(urlId: string, userId: string): Promise<void>
