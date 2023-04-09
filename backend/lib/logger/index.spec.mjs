import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { logger, errorJson } from './index.mjs';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('backend/lib/logger/index.js', async () => {
  const sandbox = sinon.createSandbox();
  /** @type {import('sinon').SinonStub} */
  let infoStub;
  /** @type {import('sinon').SinonStub} */
  let debugStub;
  /** @type {import('sinon').SinonStub} */
  let warnStub;
  /** @type {import('sinon').SinonStub} */
  let errorStub;

  beforeEach(() => {
    sandbox.restore();
    debugStub = sandbox.stub(console, 'debug');
    infoStub = sandbox.stub(console, 'info');
    warnStub = sandbox.stub(console, 'warn');
    errorStub = sandbox.stub(console, 'error');
  });

  after(() => {
    sandbox.restore();
  });

  describe('logger', async () => {
    it('debug log', async () => {
      sandbox.stub(process.env, 'NODE_ENV').value('not-test');
      sandbox.stub(process.env, 'LOG_LEVEL').value('debug');

      logger.debug('test message');

      sinon.assert.calledOnce(debugStub);
    });

    it('info log', async () => {
      sandbox.stub(process.env, 'NODE_ENV').value('not-test');
      sandbox.stub(process.env, 'LOG_LEVEL').value('info');

      logger.info('test message');

      sinon.assert.calledOnce(infoStub);
    });

    it('warn log', async () => {
      sandbox.stub(process.env, 'NODE_ENV').value('not-test');
      sandbox.stub(process.env, 'LOG_LEVEL').value('warn');

      logger.warn('test message');

      sinon.assert.calledOnce(warnStub);
    });

    it('error log', async () => {
      sandbox.stub(process.env, 'NODE_ENV').value('not-test');
      sandbox.stub(process.env, 'LOG_LEVEL').value('error');

      logger.error('test message');

      sinon.assert.calledOnce(errorStub);
    });

    it('uses debug if LOG_LEVEL is not set', async () => {
      sandbox.stub(process.env, 'NODE_ENV').value('not-test');
      sandbox.stub(process.env, 'LOG_LEVEL').value('');

      logger.debug('test message');

      sinon.assert.calledOnce(debugStub);
    });

    it('does not log if configured log level is too high', async () => {
      sandbox.stub(process.env, 'NODE_ENV').value('not-test');
      sandbox.stub(process.env, 'LOG_LEVEL').value('info');

      logger.debug('test message');

      sinon.assert.notCalled(debugStub);
    });

    it('does not log if NODE_ENV is test', async () => {
      sandbox.stub(process.env, 'NODE_ENV').value('test');
      sandbox.stub(process.env, 'LOG_LEVEL').value('debug');

      logger.debug('test message');

      sinon.assert.notCalled(debugStub);
    });
  });

  describe('errorJson', async () => {
    it('returns a json object of an error', async () => {
      const error = new Error('something bad happened');
      const result = errorJson(error);
      expect(result.message).to.equal('something bad happened');
      expect(result.stack).to.be.a('string');
    });
  });
});
