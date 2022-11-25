const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');
const BaseError = require('../errors/base');

const { apiWrapper } = require('./wrapper');

describe('src/lib/api/wrapper.js', async () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('apiWrapper', async () => {
    it('should support returning http body directly', async () => {
      const unwrapped = () => ({ message: 'success' });
      const wrapped = apiWrapper(unwrapped);
      const result = await wrapped({}, {});
      expect(result.statusCode).to.equal(200);
      expect(JSON.parse(result.body)).to.deep.equal({ message: 'success' });
    });

    it('should support returning entire http result', async () => {
      const unwrapped = () => ({ statusCode: 204, body: JSON.stringify({ message: 'success' }) });
      const wrapped = apiWrapper(unwrapped);
      const result = await wrapped({}, {});
      expect(result.statusCode).to.equal(204);
      expect(JSON.parse(result.body)).to.deep.equal({ message: 'success' });
    });

    it('should handle custom error', async () => {
      const unwrapped = () => {
        throw new BaseError('something bad happened', 'BAD_THING', 400);
      };
      const wrapped = apiWrapper(unwrapped);
      const result = await wrapped({}, {});
      expect(result.statusCode).to.equal(400);
      expect(JSON.parse(result.body)).to.deep.equal({
        message: 'something bad happened',
        code: 'BAD_THING',
      });
    });

    it('should handle any error', async () => {
      const unwrapped = () => {
        throw new Error('unknown error');
      };
      const wrapped = apiWrapper(unwrapped);
      const result = await wrapped({}, {});
      expect(result.statusCode).to.equal(500);
      expect(JSON.parse(result.body)).to.deep.equal({
        message: 'unknown internal error',
        code: 'UNKNOWN_ERROR',
      });
    });
  });
});
