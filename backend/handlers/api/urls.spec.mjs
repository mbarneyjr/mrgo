import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import * as urlsHandlers from './urls.mjs';
import UrlsLib from '../../lib/data/urls/index.mjs';
import { getApiGatewayLambdaEvent, getApiGatewayLambdaContext } from '../../lib/test-utils/index.mjs';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('backend/handlers/api/urls.mjs', async () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('listHandler', async () => {
    it('should list urls', async () => {
      const expected = {
        /** @type {import('../../lib/data/urls/index.js').Url[]} */
        urls: [{
          description: 'unittest',
          name: 'unittest',
          id: 'unittest',
          status: 'ACTIVE',
          target: 'https://unittest',
        }],
      };
      const stub = sandbox.stub(UrlsLib, 'listUrls').resolves(expected);
      const event = getApiGatewayLambdaEvent({ method: 'GET', path: '/urls' });
      const res = await urlsHandlers.listHandler(event, getApiGatewayLambdaContext());
      expect(res.statusCode).to.equal(200);
      if (res.body === undefined) throw expect.fail('response body was undefined');
      expect(JSON.parse(res.body)).to.deep.equal(expected);
      sinon.assert.calledOnce(stub);
    });

    it('should list urls with limit querystring parameter', async () => {
      const expected = {
        /** @type {import('../../lib/data/urls/index.js').Url[]} */
        urls: [{
          description: 'unittest',
          name: 'unittest',
          id: 'unittest',
          status: 'ACTIVE',
          target: 'https://unittest',
        }],
      };
      const stub = sandbox.stub(UrlsLib, 'listUrls').resolves(expected);
      const event = getApiGatewayLambdaEvent({ method: 'GET', path: '/urls', queryStringParameters: { limit: '50' } });
      const res = await urlsHandlers.listHandler(event, getApiGatewayLambdaContext());
      expect(res.statusCode).to.equal(200);
      if (res.body === undefined) throw expect.fail('response body was undefined');
      expect(JSON.parse(res.body)).to.deep.equal(expected);
      sinon.assert.calledOnceWithExactly(stub, 'unit@test.com', 50, undefined);
    });
  });

  describe('createHandler', async () => {
    it('should create a url', async () => {
      /** @type {import('../../lib/data/urls/index.js').Url} */
      const expected = {
        description: 'unittest',
        name: 'unittest',
        id: 'unittest',
        status: 'ACTIVE',
        target: 'https://unittest',
      };
      const stub = sandbox.stub(UrlsLib, 'createUrl').resolves(expected);
      const event = getApiGatewayLambdaEvent({
        method: 'POST',
        path: '/urls',
        body: JSON.stringify({
          target: 'https://unit.test',
          name: 'url-redirect-name',
        }),
      });
      const res = await urlsHandlers.createHandler(event, getApiGatewayLambdaContext());
      if (res.body === undefined) throw expect.fail('response body was undefined');
      expect(res.statusCode).to.equal(200);
      expect(JSON.parse(res.body)).to.deep.equal(expected);
      sinon.assert.calledOnce(stub);
    });
  });

  describe('getHandler', async () => {
    it('should get a url', async () => {
      /** @type {import('../../lib/data/urls/index.js').Url} */
      const expected = {
        description: 'unittest',
        name: 'unittest',
        id: 'unittest',
        status: 'ACTIVE',
        target: 'https://unittest',
      };
      const stub = sandbox.stub(UrlsLib, 'getUrl').resolves(expected);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls/{urlId}',
        pathParameters: {
          urlId: 'abc123',
        },
      });
      const res = await urlsHandlers.getHandler(event, getApiGatewayLambdaContext());
      expect(res.statusCode).to.equal(200);
      if (res.body === undefined) throw expect.fail('response body was undefined');
      expect(JSON.parse(res.body)).to.deep.equal(expected);
      sinon.assert.calledOnce(stub);
    });
  });

  describe('putHandler', async () => {
    it('should put a url', async () => {
      /** @type {import('../../lib/data/urls/index.js').Url} */
      const expected = {
        description: 'unittest',
        name: 'unittest',
        id: 'unittest',
        status: 'ACTIVE',
        target: 'https://unittest',
      };
      const stub = sandbox.stub(UrlsLib, 'putUrl').resolves(expected);
      const event = getApiGatewayLambdaEvent({
        method: 'PUT',
        path: '/urls/{urlId}',
        pathParameters: {
          urlId: 'abc123',
        },
        body: JSON.stringify({
          name: 'new-url-redirect-name',
          description: 'a-description',
        }),
      });
      const res = await urlsHandlers.putHandler(event, getApiGatewayLambdaContext());
      expect(res.statusCode).to.equal(200);
      if (res.body === undefined) throw expect.fail('response body was undefined');
      expect(JSON.parse(res.body)).to.deep.equal(expected);
      sinon.assert.calledOnce(stub);
    });
  });

  describe('deleteHandler', async () => {
    it('should delete a url', async () => {
      const stub = sandbox.stub(UrlsLib, 'deleteUrl').resolves();
      const event = getApiGatewayLambdaEvent({
        method: 'DELETE',
        path: '/urls/{urlId}',
        pathParameters: {
          urlId: 'abc123',
        },
      });
      const res = await urlsHandlers.deleteHandler(event, getApiGatewayLambdaContext());
      expect(res.statusCode).to.equal(200);
      sinon.assert.calledOnce(stub);
    });
  });
});
