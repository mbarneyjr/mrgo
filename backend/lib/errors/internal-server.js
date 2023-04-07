const BaseError = require('./base');

class InternalServerError extends BaseError {
  static errorCode = 'INTERNAL_SERVER_ERROR';

  static statusCode = 500;

  /**
   * @param {string} message error message
   * @param {object} [body]
   */
  constructor(message, body) {
    super(message, InternalServerError.errorCode, InternalServerError.statusCode, { body });
    this.name = this.constructor.name;
    if (body instanceof Error) this.cause = body;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = InternalServerError;
