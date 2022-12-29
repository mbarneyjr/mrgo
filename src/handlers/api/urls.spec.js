const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');

const urlsHandlers = require('./urls');
const urlsLib = require('../../lib/data/urls');
const { getApiGatewayLambdaEvent, getApiGatewayLambdaContext } = require('../../lib/test-utils');

describe('src/handlers/api/urls.js', async () => {
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
        nextToken: 'unittest-token',
        /** @type {import('../../lib/data/urls/index').Url[]} */
        urls: [{
          description: 'unittest',
          name: 'unittest',
          id: 'unittest',
          status: 'ACTIVE',
          target: 'https://unittest',
        }],
      };
      const stub = sandbox.stub(urlsLib, 'listUrls').resolves(expected);
      const event = getApiGatewayLambdaEvent({ method: 'GET', path: '/urls' });
      const res = await urlsHandlers.listHandler(event, getApiGatewayLambdaContext());
      expect(res.statusCode).to.equal(200);
      if (res.body === undefined) throw expect.fail('response body was undefined');
      expect(JSON.parse(res.body)).to.deep.equal(expected);
      sinon.assert.calledOnce(stub);
    });
  });

  describe('createHandler', async () => {
    it('should create a url', async () => {
      /** @type {import('../../lib/data/urls/index').Url} */
      const expected = {
        description: 'unittest',
        name: 'unittest',
        id: 'unittest',
        status: 'ACTIVE',
        target: 'https://unittest',
      };
      const stub = sandbox.stub(urlsLib, 'createUrl').resolves(expected);
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
      /** @type {import('../../lib/data/urls/index').Url} */
      const expected = {
        description: 'unittest',
        name: 'unittest',
        id: 'unittest',
        status: 'ACTIVE',
        target: 'https://unittest',
      };
      const stub = sandbox.stub(urlsLib, 'getUrl').resolves(expected);
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
      /** @type {import('../../lib/data/urls/index').Url} */
      const expected = {
        description: 'unittest',
        name: 'unittest',
        id: 'unittest',
        status: 'ACTIVE',
        target: 'https://unittest',
      };
      const stub = sandbox.stub(urlsLib, 'putUrl').resolves(expected);
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
      const stub = sandbox.stub(urlsLib, 'deleteUrl').resolves();
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
