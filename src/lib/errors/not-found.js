const BaseError = require('./base');

class NotFoundError extends BaseError {
  static errorCode = 'NOT_FOUND';

  static statusCode = 404;

  constructor(message) {
    super(message, NotFoundError.errorCode, NotFoundError.statusCode);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = NotFoundError;
