const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');

const documentationHandlers = require('./documentation');

describe('src/handlers/api/documentation.js', async () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('handler', async () => {
    it('should return the openapi spec as html', async () => {
      const res = await documentationHandlers.handler({});
      const spec = res.body;
      expect(spec).includes('<html>');
    });

    it('should return the openapi spec as json', async () => {
      const res = await documentationHandlers.handler({ queryStringParameters: { format: 'json' } });
      const spec = res;
      expect(spec.info.title).to.equal('mrgo-unittest');
    });
  });
});
