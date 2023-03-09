const BaseError = require('./base');

class UnauthorizedError extends BaseError {
  static errorCode = 'UNAUTHORIZED';

  static statusCode = 403;

  /**
   * @param {string} message error message
   */
  constructor(message) {
    super(message, UnauthorizedError.errorCode, UnauthorizedError.statusCode);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = UnauthorizedError;
