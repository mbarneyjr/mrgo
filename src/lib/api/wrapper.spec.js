const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');
const BaseError = require('../errors/base');
const { getApiGatewayLambdaEvent, getApiGatewayLambdaContext } = require('../test-utils');

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
      const unwrapped = sandbox.stub().resolves({ message: 'success' });
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
      });
      const result = await wrapped(event, getApiGatewayLambdaContext());
      expect(result.statusCode).to.equal(200, result.body);
      if (!result.body) throw expect.fail('result body was undefined');
      expect(JSON.parse(result.body)).to.deep.equal({ message: 'success' });
    });

    it('should support returning node primitives', async () => {
      const unwrapped = sandbox.stub().resolves('some string');
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
      });
      const result = await wrapped(event, getApiGatewayLambdaContext());
      expect(result.statusCode).to.equal(200, result.body);
      if (!result.body) throw expect.fail('result body was undefined');
      expect(result.body).to.equal('some string');
    });

    it('should support returning entire http result', async () => {
      const unwrapped = sandbox.stub().resolves({ statusCode: 204, body: JSON.stringify({ message: 'success' }) });
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
      });
      const result = await wrapped(event, getApiGatewayLambdaContext());
      expect(result.statusCode).to.equal(204);
      if (!result.body) throw expect.fail('result body was undefined');
      expect(JSON.parse(result.body)).to.deep.equal({ message: 'success' });
    });

    it('should support returning entire http with undefined statusCode', async () => {
      const unwrapped = sandbox.stub().resolves({ statusCode: undefined, body: JSON.stringify({ message: 'success' }) });
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
      });
      const result = await wrapped(event, getApiGatewayLambdaContext());
      expect(result.statusCode).to.equal(200);
      if (!result.body) throw expect.fail('result body was undefined');
      expect(JSON.parse(result.body)).to.deep.equal({ message: 'success' });
    });

    it('should handle options.authorizeJwt', async () => {
      const unwrapped = sandbox.stub().resolves({ message: 'success' });
      const wrapped = apiWrapper(unwrapped, { authorizeJwt: true });
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
        claims: {
          // email: undefined,
        },
      });
      const result = await wrapped(event, getApiGatewayLambdaContext());
      expect(result.statusCode).to.equal(403);
      if (!result.body) throw expect.fail('result body was undefined');
      expect(JSON.parse(result.body)).to.deep.equal({
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
    });

    it('should handle custom error', async () => {
      const unwrapped = sandbox.stub().rejects(new BaseError('something bad happened', 'BAD_THING', 400));
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
      });
      const result = await wrapped(event, getApiGatewayLambdaContext());
      expect(result.statusCode).to.equal(400);
      if (!result.body) throw expect.fail('result body was undefined');
      expect(JSON.parse(result.body)).to.deep.equal({
        error: {
          message: 'something bad happened',
          code: 'BAD_THING',
        },
      });
    });

    it('should throw unknown errors', async () => {
      const err = new Error('unknown error');
      const unwrapped = sandbox.stub().rejects(err);
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
      });
      expect(wrapped(event, getApiGatewayLambdaContext())).to.eventually.be.rejectedWith(err);
    });

    it('should throw if specifying invalid parameters', async () => {
      const unwrapped = sandbox.stub();
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
        queryStringParameters: {
          invalid: 'property',
        },
      });
      const result = await wrapped(event, getApiGatewayLambdaContext());
      expect(result.statusCode).to.equal(400);
      expect(result.body).to.include('should NOT have additional properties');
    });

    it('should throw if specifying invalid body', async () => {
      const unwrapped = sandbox.stub();
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'POST',
        path: '/urls',
        body: JSON.stringify({
          target: 'foo.com',
          extraProperty: 'foo',
          status: 'INVALID_STATUS',
        }),
      });
      const result = await wrapped(event, getApiGatewayLambdaContext());
      expect(result.statusCode).to.equal(400);
      expect(result.body).to.include('should NOT have additional properties');
      expect(result.body).to.include('should be equal to one of the allowed values');
    });

    it('should base64 decode body if specified', async () => {
      const unwrapped = sandbox.stub().resolves({ message: 'success' });
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'POST',
        path: '/urls',
        body: Buffer.from(JSON.stringify({
          target: 'https://unit.test',
        })).toString('base64'),
        isBase64Encoded: true,
      });
      const context = getApiGatewayLambdaContext();
      const result = await wrapped(event, context);
      expect(result.statusCode).to.equal(200, result.body);
      sinon.assert.calledOnceWithExactly(unwrapped, { ...event, body: { target: 'https://unit.test' } }, context);
    });

    it('should parse request body if specified', async () => {
      const unwrapped = sandbox.stub().resolves({ message: 'success' });
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'POST',
        path: '/urls',
        body: JSON.stringify({
          target: 'https://unit.test',
        }),
      });
      if (!event.body) throw expect.fail('event body is undefined');
      const context = getApiGatewayLambdaContext();
      const result = await wrapped(event, context);
      expect(result.statusCode).to.equal(200, result.body);
      sinon.assert.calledOnceWithExactly(unwrapped, { ...event, body: JSON.parse(event.body) }, context);
    });

    it('should leave request body untouched if not parsable', async () => {
      const unwrapped = sandbox.stub().resolves({ message: 'success' });
      const wrapped = apiWrapper(unwrapped);
      const event = getApiGatewayLambdaEvent({
        method: 'GET',
        path: '/urls',
        body: 'some,other,data,format',
      });
      const context = getApiGatewayLambdaContext();
      const result = await wrapped(event, context);
      expect(result.statusCode).to.equal(200, result.body);
      sinon.assert.calledOnceWithExactly(unwrapped, event, context);
    });
  });
});
