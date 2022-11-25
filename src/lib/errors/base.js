class BaseError extends Error {
  /**
   * @param {string} message the error message
   * @param {string} code the error code
   * @param {number} statusCode http statuscode associated with error
   */
  constructor(message, code, statusCode) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    /** @type {string} */
    this.name = this.constructor.name;
    /** @type {boolean} */
    this.isCustomError = true;
    /** @type {string} */
    this.code = code;
    /** @type {number} */
    this.statusCode = statusCode;
  }
}

module.exports = BaseError;
