const BaseError = require('./base');

class NotFoundError extends BaseError {
  static errorCode = 'NOT_FOUND';

  static statusCode = 404;

  /**
   * An error for accessing an entity that does not exist
   * @param {string} message the not found error message
   * @param {Record<string, unknown>} [body] the not found error body
   */
  constructor(message, body) {
    super(message, NotFoundError.errorCode, NotFoundError.statusCode, body);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = NotFoundError;
