export class BaseError extends Error {
  name: string;
  isCustomError: boolean;
  code: string;
  body: unknown;
  cause?: Error;

  constructor(message: string, code: string, body: unknown, cause?: Error) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.isCustomError = true;
    this.code = code;
    this.body = body;
    this.cause = cause;
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, body?: Record<string, unknown>, cause?: Error) {
    super(message, "CONFLICT", body, cause);
  }
}
