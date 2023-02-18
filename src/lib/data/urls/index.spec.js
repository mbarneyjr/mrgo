const chai = require('chai');
chai.use(require('chai-as-promised'));

const { expect } = chai;
const sinon = require('sinon');

const { ConditionalCheckFailedException } = require('@aws-sdk/client-dynamodb');

const urlLib = require('./index');
const errors = require('../../errors');
const config = require('../../config');

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
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Items: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
        }],
        LastEvaluatedKey: {
          id: 'test-id',
        },
      });
      const result = await urlLib.listUrls('test-userId');
      expect(result).to.deep.equal({
        urls: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
        }],
        nextToken: Buffer.from(JSON.stringify({ id: 'test-id' })).toString('base64'),
      });
    });

    it('should throw when invalid nextToken specified', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Items: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
        }],
        LastEvaluatedKey: {
          id: 'test-id',
        },
      });
      await expect(urlLib.listUrls('test-userId', 'invalid-nextToken')).to.eventually.be.rejectedWith(errors.ValidationError);
    });

    it('should not return nextToken when one not returned from dynamo', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Items: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
        }],
      });
      const result = await urlLib.listUrls('test-userId');
      expect(result).to.deep.equal({
        urls: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
        }],
        nextToken: undefined,
      });
    });
  });

  describe('createUrl', async () => {
    it('should create and return the url', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves();
      sandbox.stub(urlLib, 'uuid').returns('test-id');

      const result = await urlLib.createUrl({
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'ACTIVE',
      }, 'unittest');
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
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Item: {
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
          userId: 'test-userId',
        },
      });
      const result = await urlLib.getUrl('test-urlId');
      expect(result).to.deep.equal({
        id: 'test-id',
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'INACTIVE',
      });
    });
    it('should throw a NotFoundError if userId is not the same', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Item: undefined,
      });
      await expect(urlLib.getUrl('test-urlId')).to.be.eventually.rejectedWith(errors.NotFoundError);
    });
  });

  describe('putUrl', async () => {
    it('should update a url', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Attributes: {
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
          userId: 'test-userId',
        },
      });
      const result = await urlLib.putUrl({
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'INACTIVE',
      }, 'test-id', 'test-userId');
      expect(result).to.deep.equal({
        id: 'test-id',
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'INACTIVE',
      });
    });

    it('should update a url with null items', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Attributes: {
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
          userId: 'test-userId',
        },
      });
      await urlLib.putUrl({
        name: null,
        description: null,
        target: null,
        status: null,
      }, 'test-id', 'test-userId');
    });

    it('should update a url with empty object', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Attributes: {
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
          userId: 'test-userId',
        },
      });
      await urlLib.putUrl({}, 'test-id', 'test-userId');
    });

    it('should update a url with null items', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Attributes: {
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
          userId: 'test-userId',
        },
      });
      const result = await urlLib.putUrl({
        name: null,
        description: null,
        target: null,
        status: null,
      }, 'test-id', 'test-userId');
      expect(result).to.deep.equal({
        id: 'test-id',
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'INACTIVE',
      });
    });

    it('should throw not found error when condition check fails', async () => {
      sandbox.stub(urlLib.dbc(), 'send').rejects(new ConditionalCheckFailedException({ $metadata: {}, message: 'the thing failed' }));
      await expect(urlLib.putUrl({
        name: null,
        description: null,
        target: null,
        status: null,
      }, 'test-id', 'test-userId')).to.eventually.be.rejectedWith(errors.NotFoundError);
    });

    it('should throw error when other error thrown', async () => {
      const err = new Error('bad things happened');
      sandbox.stub(urlLib.dbc(), 'send').rejects(err);
      await expect(urlLib.putUrl({
        name: null,
        description: null,
        target: null,
        status: null,
      }, 'test-id', 'test-userId')).to.eventually.be.rejectedWith(err);
    });
  });

  describe('deleteUrl', async () => {
    it('should not throw an error when condition check thrown', async () => {
      sandbox.stub(config.dynamodb, 'tableName').value('test-table');
      sandbox.stub(urlLib.dbc(), 'send').rejects(new ConditionalCheckFailedException({ $metadata: {}, message: 'the thing failed' }));
      await urlLib.deleteUrl('test-urlId', 'test-userId');
    });

    it('should throw an error when unexpected error thrown', async () => {
      const err = new Error('something bad happened');
      sandbox.stub(urlLib.dbc(), 'send').rejects(err);
      await expect(urlLib.deleteUrl('test-urlId', 'test-userId')).to.eventually.be.rejectedWith(err);
    });
  });
});
