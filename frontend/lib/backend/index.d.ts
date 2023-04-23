import { ApiErrorResponseBody } from '../../../backend/lib/api/wrapper';
import {
  Url,
  UrlUpdateRequest,
  UrlCreateRequest,
  UrlListResponse,
} from '../../../backend/lib/data/urls/index';
import { LoggedInSession } from '../middleware/auth/index';

export interface ErrorResponse {
  message: string
}

export type DataOrError<T> = {
  result: T
} | {
  error: string
};

export {
  ApiErrorResponseBody,
};

export async function getUrl(urlId: string): Promise<DataOrError<Url>>;
export async function getUrls(paginationToken: string | undefined, session: LoggedInSession): Promise<DataOrError<UrlListResponse>>;
export async function updateUrl(urlId: string, updateRequest: UrlUpdateRequest, session: LoggedInSession): Promise<DataOrError<Url>>;
export async function createUrl(urlCreateRequest: UrlCreateRequest, session: LoggedInSession): Promise<DataOrError<Url>>;
export async function deleteUrl(urlId: string, session: LoggedInSession): Promise<void>;
