const BaseError = require('./base');

class ValidationError extends BaseError {
  static errorCode = 'INVALID_REQUEST';

  static statusCode = 400;

  /**
   * @param {string} message error message
   * @param {Array<object>} [validationErrors]
   */
  constructor(message, validationErrors) {
    super(message, ValidationError.errorCode, ValidationError.statusCode, { validationErrors });
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ValidationError;
