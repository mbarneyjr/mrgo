const BaseError = require('./base');

class InvalidError extends BaseError {
  static errorCode = 'INVALID';

  static statusCode = 400;

  constructor(message) {
    super(message, InvalidError.errorCode, InvalidError.statusCode);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = InvalidError;
