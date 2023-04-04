class BaseError extends Error {
  /**
   * @param {string} message the error message
   * @param {string} code the error code
   * @param {number} statusCode http statuscode associated with error
   * @param {Record<string, unknown>} [body] error body
   */
  constructor(message, code, statusCode, body) {
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
    /** @type {Record<string, unknown>} */
    this.body = body ?? {};
  }
}

module.exports = BaseError;
