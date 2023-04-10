import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { getApiGatewayLambdaEvent, getApiGatewayLambdaContext } from '../../lib/test-utils/index.mjs';
import * as documentationHandlers from './documentation.mjs';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('backend/handlers/api/documentation.mjs', async () => {
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
