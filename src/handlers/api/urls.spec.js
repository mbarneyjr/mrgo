const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');

const urlsHandlers = require('./urls');
const urlsLib = require('../../lib/data/urls');

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
        urls: [{
          description: 'unittest',
          name: 'unittest',
          id: 'unittest',
          status: 'ACTIVE',
          target: 'https://unittest',
        }],
      };
      sandbox.stub(urlsLib, 'listUrls').resolves(expected);
      const res = await urlsHandlers.listHandler();
      expect(res.statusCode).to.equal(200);
      expect(JSON.parse(res.body)).to.deep.equal(expected);
    });
    sinon.assert.calledOnce(urlsLib.listUrls);
  });

  describe('createHandler', async () => {
    const expected = {
      description: 'unittest',
      name: 'unittest',
      id: 'unittest',
      status: 'ACTIVE',
      target: 'https://unittest',
    };
    sandbox.stub(urlsLib, 'createUrl').resolves(expected);
    const res = await urlsHandlers.createHandler();
    expect(res.statusCode).to.equal(200);
    expect(JSON.parse(res.body)).to.deep.equal(expected);
    sinon.assert.calledOnce(urlsLib.createUrl);
  });

  describe('getHandler', async () => {
    const expected = {
      description: 'unittest',
      name: 'unittest',
      id: 'unittest',
      status: 'ACTIVE',
      target: 'https://unittest',
    };
    sandbox.stub(urlsLib, 'getUrl').resolves(expected);
    const res = await urlsHandlers.getHandler();
    expect(res.statusCode).to.equal(200);
    expect(JSON.parse(res.body)).to.deep.equal(expected);
    sinon.assert.calledOnce(urlsLib.getUrl);
  });

  describe('putHandler', async () => {
    const expected = {
      description: 'unittest',
      name: 'unittest',
      id: 'unittest',
      status: 'ACTIVE',
      target: 'https://unittest',
    };
    sandbox.stub(urlsLib, 'putUrl').resolves(expected);
    const res = await urlsHandlers.putHandler();
    expect(res.statusCode).to.equal(200);
    expect(JSON.parse(res.body)).to.deep.equal(expected);
    sinon.assert.calledOnce(urlsLib.putUrl);
  });

  describe('deleteHandler', async () => {
    sandbox.stub(urlsLib, 'deleteUrl').resolves();
    const res = await urlsHandlers.deleteHandler();
    expect(res.statusCode).to.equal(200);
    sinon.assert.calledOnce(urlsLib.deleteUrl);
  });
});
