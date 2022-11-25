const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');

const urlLib = require('./index');

describe('src/lib/data/urls/index.js', async () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('listUrls', async () => {
    it('should return a list of urls', async () => {
      const result = await urlLib.listUrls();
      expect(result).to.deep.equal({
        urls: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
        }],
        nextToken: 'test-token',
      });
    });
  });

  describe('createUrl', async () => {
    it('should create and return the url', async () => {
      const result = await urlLib.createUrl();
      expect(result).to.deep.equal({
        id: 'test-id',
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'ACTIVE',
      });
    });
  });

  describe('getUrl', async () => {
    it('should get a single url', async () => {
      const result = await urlLib.getUrl();
      expect(result).to.deep.equal({
        id: 'test-id',
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'INACTIVE',
      });
    });
  });

  describe('putUrl', async () => {
    it('should update a url', async () => {
      const result = await urlLib.putUrl();
      expect(result).to.deep.equal({
        id: 'test-id',
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'INACTIVE',
      });
    });
  });

  describe('deleteUrl', async () => {
    it('should return the openapi spec as html', async () => {
      await urlLib.deleteUrl();
    });
  });
});
