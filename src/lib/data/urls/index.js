const { DynamoDBClient, ConditionalCheckFailedException } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const ShortUniqueId = require('short-unique-id');

const config = require('../../config');
const errors = require('../../errors');

exports.uuid = new ShortUniqueId();

/** @type {import('@aws-sdk/lib-dynamodb').DynamoDBDocument} */
let documentClient;

/* istanbul ignore next */
exports.dbc = function dbc() {
  if (documentClient !== undefined) return documentClient;
  const ddb = new DynamoDBClient();
  documentClient = DynamoDBDocumentClient.from(ddb, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: true,
      convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
      wrapNumbers: true,
    },
  });
  return documentClient;
};

/**
 * Object representing a URL redirect
 * @typedef {object} Url
 * @property {string} id the ID of the URL (slug that's used to redirect)
 * @property {string} name the user-defined name of the URL
 * @property {string} description the user-defined description of the URL
 * @property {string} target the target https URL to redirect to
 * @property {string} userId the Id of the creating user
 * @property {'ACTIVE'|'INACTIVE'|'DELETED'} status the status of the URL
 * @typedef {object} UrlCreateRequest
 * @property {string} name the user-defined name of the URL
 * @property {string} description the user-defined description of the URL
 * @property {string} target the target https URL to redirect to
 * @property {'ACTIVE'|'INACTIVE'|'DELETED'} status the status of the URL
 */

/**
 * @param {string} userId
 * @returns {Promise<{ urls: Array<Url>, nextToken: string }>}
 */
exports.listUrls = async (userId, nextToken) => {
  let parsedNextToken;
  try {
    if (nextToken) parsedNextToken = JSON.parse(Buffer.from(nextToken, 'base64').toString());
  } catch (err) {
    throw new errors.ValidationError('invalid nextToken');
  }
  /** @type {import('@aws-sdk/lib-dynamodb').QueryCommandInput} */
  const queryParams = {
    TableName: config.dynamodb.tableName,
    IndexName: config.dynamodb.indexes.byUserId,
    KeyConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: {
      '#userId': 'userId',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    ExclusiveStartKey: parsedNextToken,
  };
  const response = await exports.dbc().send(new QueryCommand(queryParams));
  const newNextToken = response.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64')
    : undefined;
  const urls = response.Items?.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    target: item.target,
    status: item.status,
  }));
  return {
    urls,
    nextToken: newNextToken,
  };
};

/**
 * @param {UrlCreateRequest} item
 * @param {string} string
 * @returns {Promise<Url>}
 */
exports.createUrl = async (item, userId) => {
  const urlId = exports.uuid();
  const dynamodbItem = {
    ...item,
    id: urlId,
    userId,
  };
  await exports.dbc().send(new PutCommand({
    TableName: config.dynamodb.tableName,
    Item: dynamodbItem,
  }));
  return {
    id: urlId,
    name: item.name,
    description: item.description,
    target: item.target,
    status: item.status,
  };
};

/**
 * @param {string} urlId
 * @param {string} userId
 * @returns {Promise<Url>}
 */
exports.getUrl = async (urlId, userId) => {
  const result = await exports.dbc().send(new GetCommand({
    TableName: config.dynamodb.tableName,
    Key: {
      id: urlId,
    },
  }));
  if (result?.Item?.userId !== userId) throw new errors.NotFoundError('url not found', { id: urlId });
  return {
    id: result.Item.id,
    name: result.Item.name,
    description: result.Item.description,
    target: result.Item.target,
    status: result.Item.status,
  };
};

/**
 * @param {UrlCreateRequest} urlUpdateRequest
 * @param {string} urlId
 * @param {string} userId
 * @returns {Promise<Url>}
 */
exports.putUrl = async (urlUpdateRequest, urlId, userId) => {
  const expressionAttributeNames = {
    '#userId': 'userId',
  };
  const expressionAttributeValues = {
    ':userId': userId,
  };
  const setUpdateExpressions = [];
  const removeUpdateExpressions = [];

  if (urlUpdateRequest.name !== undefined) {
    expressionAttributeValues[':name'] = urlUpdateRequest.name;
    if (urlUpdateRequest.name === null) {
      removeUpdateExpressions.push(':name');
    } else {
      setUpdateExpressions.push('#name=:name');
      expressionAttributeNames['#name'] = 'name';
    }
  }
  if (urlUpdateRequest.description !== undefined) {
    expressionAttributeValues[':description'] = urlUpdateRequest.description;
    if (urlUpdateRequest.description === null) {
      removeUpdateExpressions.push(':description');
    } else {
      setUpdateExpressions.push('#description=:description');
      expressionAttributeNames['#description'] = 'description';
    }
  }
  if (urlUpdateRequest.target !== undefined) {
    expressionAttributeValues[':target'] = urlUpdateRequest.target;
    if (urlUpdateRequest.target === null) {
      removeUpdateExpressions.push(':target');
    } else {
      setUpdateExpressions.push('#target=:target');
      expressionAttributeNames['#target'] = 'target';
    }
  }
  if (urlUpdateRequest.status !== undefined) {
    expressionAttributeValues[':status'] = urlUpdateRequest.status;
    if (urlUpdateRequest.status === null) {
      removeUpdateExpressions.push(':status');
    } else {
      setUpdateExpressions.push('#status=:status');
      expressionAttributeNames['#status'] = 'status';
    }
  }

  const updateExpressions = [];
  if (setUpdateExpressions.length) {
    updateExpressions.push(`SET ${setUpdateExpressions.join(', ')}`);
  }
  if (removeUpdateExpressions.length) {
    updateExpressions.push(`DELETE ${removeUpdateExpressions.join(', ')}`);
  }

  /** @type {import('@aws-sdk/lib-dynamodb').UpdateCommandInput} */
  const updateParams = {
    TableName: config.dynamodb.tableName,
    Key: {
      id: urlId,
    },
    UpdateExpression: updateExpressions.join(' '),
    ConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  const updatedItem = {};
  try {
    const result = await exports.dbc().send(new UpdateCommand(updateParams));
    updatedItem.id = result.Attributes.id;
    updatedItem.name = result.Attributes.name;
    updatedItem.description = result.Attributes.description;
    updatedItem.target = result.Attributes.target;
    updatedItem.status = result.Attributes.status;
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new errors.NotFoundError('url not found', { id: urlId });
    }
    throw err;
  }
  return updatedItem;
};

/**
 * @param {string} urlId
 * @param {string} userId
 * @returns {Promise<void>}
 */
exports.deleteUrl = async (urlId, userId) => {
  try {
    await exports.dbc().send(new DeleteCommand({
      TableName: config.dynamodb.tableName,
      Key: {
        id: urlId,
      },
      ConditionExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));
  } catch (err) {
    if (!(err instanceof ConditionalCheckFailedException)) {
      throw err;
    }
  }
};
