const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');
const errors = require('./index');

describe('src/lib/api/wrapper.js', async () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('base', async () => {
    it('correctly constructs a base error', async () => {
      const error = new errors.BaseError('mymessage', 'TEST_CODE', 123);
      expect(error.message).to.equal('mymessage');
      expect(error.code).to.equal('TEST_CODE');
      expect(error.statusCode).to.equal(123);
    });
  });

  describe('validation', async () => {
    it('correctly constructs a validation error', async () => {
      const error = new errors.ValidationError('my invalid message');
      expect(error.message).to.equal('my invalid message');
      expect(error.code).to.equal(errors.ValidationError.errorCode);
      expect(error.statusCode).to.equal(errors.ValidationError.statusCode);
    });
  });

  describe('not-found', async () => {
    it('correctly constructs a not-found error', async () => {
      const error = new errors.NotFoundError('my invalid message');
      expect(error.message).to.equal('my invalid message');
      expect(error.code).to.equal(errors.NotFoundError.errorCode);
      expect(error.statusCode).to.equal(errors.NotFoundError.statusCode);
    });
  });
});
