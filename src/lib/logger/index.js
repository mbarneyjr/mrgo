/**
 * @param {string | undefined} input
 * @returns {number}
 */
function getLogLevel(input) {
  /** @type {Record<import('./index.js').LogLevel, number>} */
  const logLevelMap = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
  };
  if (input !== undefined && input in logLevelMap) return logLevelMap[/** @type {import('./index').LogLevel} */ (input)];
  return logLevelMap.debug;
}

/** @type {import('./index.js').log} */
function log(level, message, data) {
  /** @type {import('./index.js').Log} */
  const logLine = {
    message,
    data,
  };

  if (getLogLevel(process.env.LOG_LEVEL) <= getLogLevel(level)) {
    /* eslint-disable-next-line no-console */
    if (process.env.NODE_ENV !== 'test') console[level](JSON.stringify(logLine));
  }
  return logLine;
}

/** @type {Record<import('./index.js').LogLevel, import('./index.js').LoggerFunction>} */
const logger = {
  debug: (message, data) => log('debug', message, data),
  info: (message, data) => log('info', message, data),
  warn: (message, data) => log('warn', message, data),
  error: (message, data) => log('error', message, data),
};

/** @type {import('./index.js').errorJson} */
const errorJson = (err) => JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));

exports.logger = logger;
exports.errorJson = errorJson;
