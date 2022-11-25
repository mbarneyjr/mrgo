/**
 * Object representing a URL redirect
 * @typedef {object} Url
 * @property {string} id the ID of the URL (slug that's used to redirect)
 * @property {string} name  the user-defined name of the URL
 * @property {string} description  the user-defined description of the URL
 * @property {string} target  the target https URL to redirect to
 * @property {'ACTIVE'|'INACTIVE'|'DELETED'} status  the status of the URL
 */

/**
 * @returns {Promise<{ urls: Array<Url>, nextToken: string }>}
 */
exports.listUrls = async () => {
  return {
    urls: [{
      id: 'test-id',
      name: 'test-name',
      description: 'test-description',
      target: 'https://mbarney.me',
      status: 'INACTIVE',
    }],
    nextToken: 'test-token',
  };
};

/**
 * @returns {Promise<Url>}
 */
exports.createUrl = async () => {
  return {
    id: 'test-id',
    name: 'test-name',
    description: 'test-description',
    target: 'https://mbarney.me',
    status: 'ACTIVE',
  };
};

/**
 * @returns {Promise<Url>}
 */
exports.getUrl = async () => {
  return {
    id: 'test-id',
    name: 'test-name',
    description: 'test-description',
    target: 'https://mbarney.me',
    status: 'INACTIVE',
  };
};

/**
 * @returns {Promise<Url>}
 */
exports.putUrl = async () => {
  return {
    id: 'test-id',
    name: 'test-name',
    description: 'test-description',
    target: 'https://mbarney.me',
    status: 'INACTIVE',
  };
};

/**
 * @returns {Promise<void>}
 */
exports.deleteUrl = async () => {
};
