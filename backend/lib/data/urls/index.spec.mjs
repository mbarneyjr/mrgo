import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import sinon from 'sinon';

import * as urlLib from './index.mjs';
import * as errors from '../../errors/index.mjs';
import config from '../../config/index.mjs';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('backend/lib/data/urls/index.js', async () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('listUrls', async () => {
    it('should return a list of urls', async () => {
      sandbox.stub(urlLib.dbc(), 'send')
        .onFirstCall()
        .resolves({
          Items: [{
            id: 'test-id',
            name: 'test-name',
            description: 'test-description',
            target: 'https://mbarney.me',
            status: 'ACTIVE',
          }, {
            id: 'future-id',
            name: 'future-name',
            description: 'future-description',
            target: 'https://mbarney.me',
            status: 'ACTIVE',
          }],
          LastEvaluatedKey: {
            id: 'test-id',
          },
        })
        .onSecondCall()
        .resolves({
          Items: [],
        });
      const result = await urlLib.listUrls('test-userId', 10);
      expect(result).to.deep.equal({
        urls: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'ACTIVE',
        }, {
          id: 'future-id',
          name: 'future-name',
          description: 'future-description',
          target: 'https://mbarney.me',
          status: 'ACTIVE',
        }],
        backwardPaginationToken: undefined,
        forwardPaginationToken: undefined,
      });
    });

    it('should handle backwards pagination, keeping order', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Items: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'ACTIVE',
        }, {
          id: 'intermediate-id',
          name: 'intermediate-name',
          description: 'intermediate-description',
          target: 'https://mbarney.me',
          status: 'ACTIVE',
        }, {
          id: 'future-id',
          name: 'future-name',
          description: 'future-description',
          target: 'https://mbarney.me',
          status: 'ACTIVE',
        }],
        LastEvaluatedKey: {
          id: 'test-id',
        },
      });

      const backwardPaginationToken = Buffer.from(JSON.stringify({
        direction: 'backward',
        exclusiveStartKey: { id: 'past-id' },
      })).toString('base64');
      const result = await urlLib.listUrls('test-userId', 2, backwardPaginationToken);

      expect(result).to.deep.equal({
        urls: [{
          id: 'intermediate-id',
          name: 'intermediate-name',
          description: 'intermediate-description',
          target: 'https://mbarney.me',
          status: 'ACTIVE',
        }, {
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'ACTIVE',
        }],
        backwardPaginationToken: Buffer.from(JSON.stringify({ direction: 'backward', exclusiveStartKey: { id: 'intermediate-id' } })).toString('base64'),
        forwardPaginationToken: Buffer.from(JSON.stringify({ direction: 'forward', exclusiveStartKey: { id: 'test-id' } })).toString('base64'),
      });
    });

    it('should throw when invalid paginationToken specified', async () => {
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
      await expect(urlLib.listUrls('test-userId', 10, 'invalid-paginationToken')).to.eventually.be.rejectedWith(errors.ValidationError);
    });

    it('should return empty array when dynamo returns undefined response.Items', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Items: undefined,
      });
      const response = await urlLib.listUrls('test-userId', 10);
      expect(response).to.deep.equal({
        urls: [],
        backwardPaginationToken: undefined,
        forwardPaginationToken: undefined,
      });
    });

    it('should not return paginationToken when one not returned from dynamo', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Items: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
        }],
      });
      const result = await urlLib.listUrls('test-userId', 10);
      expect(result).to.deep.equal({
        urls: [{
          id: 'test-id',
          name: 'test-name',
          description: 'test-description',
          target: 'https://mbarney.me',
          status: 'INACTIVE',
        }],
        forwardPaginationToken: undefined,
        backwardPaginationToken: undefined,
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

    it('should handle a hostname for target', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves();
      sandbox.stub(urlLib, 'uuid').returns('test-id');

      const result = await urlLib.createUrl({
        name: 'test-name',
        description: 'test-description',
        target: 'mbarney.me',
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

    it('should use ACTIVE as default status', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves();
      sandbox.stub(urlLib, 'uuid').returns('test-id');

      const result = await urlLib.createUrl({
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
      }, 'unittest');
      expect(result).to.deep.equal({
        id: 'test-id',
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'ACTIVE',
      });
    });

    it('should throw if target is invalid', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves();
      sandbox.stub(urlLib, 'uuid').returns('test-id');

      await expect(urlLib.createUrl({
        name: 'test-name',
        description: 'test-description',
        target: '',
        status: 'ACTIVE',
      }, 'unittest')).to.eventually.be.rejectedWith(errors.ValidationError);
    });

    it('should automatically retry if duplicate uuids generated causing dynamodb condition check to fail', async () => {
      sandbox.stub(urlLib.dbc(), 'send')
        .onFirstCall()
        .rejects(new ConditionalCheckFailedException({ $metadata: {}, message: 'the thing failed' }))
        .onSecondCall()
        .resolves();
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

    it('should limit retry if duplicate uuids generated causing dynamodb condition check to fail', async () => {
      sandbox.stub(urlLib.dbc(), 'send').rejects(new ConditionalCheckFailedException({ $metadata: {}, message: 'the thing failed' }));
      sandbox.stub(urlLib, 'uuid').returns('test-id');
      await expect(urlLib.createUrl({
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'ACTIVE',
      }, 'unittest')).to.eventually.be.rejectedWith(errors.InternalServerError);
    }).timeout(6000);

    it('should fail if dynamodb throws', async () => {
      sandbox.stub(urlLib.dbc(), 'send')
        .rejects(new Error('something bad happened'));
      sandbox.stub(urlLib, 'uuid').returns('test-id');
      await expect(urlLib.createUrl({
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'ACTIVE',
      }, 'unittest')).to.eventually.be.rejectedWith(Error);
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
          status: 'ACTIVE',
          userId: 'test-userId',
        },
      });
      const result = await urlLib.getUrl('test-urlId');
      expect(result).to.deep.equal({
        id: 'test-id',
        name: 'test-name',
        description: 'test-description',
        target: 'https://mbarney.me',
        status: 'ACTIVE',
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

    it('should throw if dynamodb returns undefined response.Attributes', async () => {
      sandbox.stub(urlLib.dbc(), 'send').resolves({
        Attributes: undefined,
      });
      await expect(urlLib.putUrl({
        name: null,
        description: null,
        target: null,
        status: null,
      }, 'test-id', 'test-userId')).to.eventually.be.rejectedWith(errors.InternalServerError);
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
