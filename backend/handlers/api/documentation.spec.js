const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');
const { getApiGatewayLambdaEvent, getApiGatewayLambdaContext } = require('../../lib/test-utils');

const documentationHandlers = require('./documentation');

describe('backend/handlers/api/documentation.js', async () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('handler', async () => {
    it('should return the openapi spec as html', async () => {
      const event = getApiGatewayLambdaEvent({ method: 'GET', path: '/docs' });
      const res = await documentationHandlers.handler(event, getApiGatewayLambdaContext());
      const spec = res.body;
      expect(spec).includes('<html>');
    });

    it('should return the openapi spec as json', async () => {
      const event = getApiGatewayLambdaEvent({ method: 'GET', path: '/docs', queryStringParameters: { format: 'json' } });
      const res = await documentationHandlers.handler(event, getApiGatewayLambdaContext());
      if (res.body === undefined) throw expect.fail('response body was undefined');
      const spec = JSON.parse(res.body);
      expect(spec.info.title).to.equal('mrgo-unittest');
    });
  });
});
