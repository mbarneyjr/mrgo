import { ApiErrorResponseBody } from '../../../backend/lib/api/wrapper';

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
