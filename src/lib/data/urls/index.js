const { DynamoDBClient, ConditionalCheckFailedException } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const { default: ShortUniqueId } = require('short-unique-id');

const { logger, errorJson } = require('../../logger/index');
const config = require('../../config');
const errors = require('../../errors');

exports.uuid = new ShortUniqueId();

/** @type {import('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient} */
let documentClient;

/**
 * @returns {import('@aws-sdk/lib-dynamodb').DynamoDBDocumentClient}
 */
/* istanbul ignore next */
exports.dbc = function dbc() {
  if (documentClient !== undefined) return documentClient;
  const ddb = new DynamoDBClient({});
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

function makeKey(record) {
  return {
    id: record?.id,
    userId: record?.userId,
  };
}

/** @type {import('./index').listUrls} */
exports.listUrls = async (userId, limit, paginationToken) => {
  let parsedPaginationToken;
  try {
    if (paginationToken) parsedPaginationToken = JSON.parse(Buffer.from(paginationToken, 'base64').toString());
  } catch (err) {
    throw new errors.ValidationError('invalid paginationToken');
  }

  const requestedDirection = parsedPaginationToken?.direction ?? 'forward';
  const exclusiveStartKey = parsedPaginationToken?.exclusiveStartKey;

  /** @type {import('@aws-sdk/lib-dynamodb').QueryCommandInput} */
  const queryParams = {
    TableName: config.dynamodb.tableName,
    IndexName: config.dynamodb.indexes.byUserId,
    Limit: 4,
    KeyConditionExpression: '#userId = :userId',
    FilterExpression: '#status <> :deleted',
    ExpressionAttributeNames: {
      '#userId': 'userId',
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':deleted': 'DELETED',
    },
    ExclusiveStartKey: exclusiveStartKey,
    ScanIndexForward: requestedDirection === 'forward',
  };

  let responseItems = [];
  let hasMoreResults = true;

  while (responseItems.length < limit && hasMoreResults) {
    const response = await exports.dbc().send(new QueryCommand(queryParams));
    if (response.Items) responseItems = responseItems.concat(response.Items);
    // if response.LastEvaluatedKey is present, we have more pagination to do
    hasMoreResults = response.LastEvaluatedKey !== undefined;
    queryParams.ExclusiveStartKey = response.LastEvaluatedKey;
  }

  responseItems = responseItems.slice(0, limit);

  // keep page ordering for backward pagination
  if (requestedDirection === 'backward') {
    responseItems.reverse();
  }

  let forwardPaginationToken;
  if ((requestedDirection === 'backward' || hasMoreResults)) {
    const forwardPaginationObject = {
      direction: 'forward',
      exclusiveStartKey: makeKey(responseItems[responseItems.length - 1]),
    };
    forwardPaginationToken = Buffer.from(JSON.stringify(forwardPaginationObject)).toString('base64');
  }

  let backwardPaginationToken;
  const requestedFirstPage = paginationToken === undefined;
  if (!requestedFirstPage && (requestedDirection === 'forward' || hasMoreResults)) {
    const backwardPaginationObject = {
      direction: 'backward',
      exclusiveStartKey: makeKey(responseItems[0]),
    };
    backwardPaginationToken = Buffer.from(JSON.stringify(backwardPaginationObject)).toString('base64');
  }

  const urls = /** @type {import('./index').Url[]} */ (responseItems?.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    target: item.target,
    status: item.status,
  })));

  return {
    urls,
    forwardPaginationToken,
    backwardPaginationToken,
  };
};

/** @type {import('./index').createUrl} */
exports.createUrl = async (item, userId) => {
  if (!item.target) throw new errors.ValidationError('missing url target');
  const targetWithProtocol = item.target.includes('://') ? item.target : `https://${item.target}`;
  const status = item.status || 'ACTIVE';

  let attempts = 0;
  while (attempts < 3) {
    attempts += 1;
    try {
      const urlId = exports.uuid();
      const dynamodbItem = {
        ...item,
        status,
        id: urlId,
        userId,
        target: targetWithProtocol,
      };
      await exports.dbc().send(new PutCommand({
        TableName: config.dynamodb.tableName,
        Item: dynamodbItem,
        ConditionExpression: 'attribute_not_exists(#id)',
        ExpressionAttributeNames: {
          '#id': 'id',
        },
      }));
      return {
        id: urlId,
        name: dynamodbItem.name,
        description: dynamodbItem.description,
        target: dynamodbItem.target,
        status,
      };
    } catch (err) {
      if (!(err instanceof ConditionalCheckFailedException)) {
        logger.error('could not create URL', { error: errorJson(err), userId, createRequest: item });
        throw err;
      }
      logger.warn('uuid created key that already exists, retrying', { error: errorJson(err), userId, createRequest: item });
    }
  }
  throw new errors.InternalServerError('could not create url, we are experiencing issues');
};

/** @type {import('./index').getUrl} */
exports.getUrl = async (urlId) => {
  const result = await exports.dbc().send(new GetCommand({
    TableName: config.dynamodb.tableName,
    Key: {
      id: urlId,
    },
  }));
  if (!result?.Item) throw new errors.NotFoundError('url not found', { id: urlId });
  /** @type {import('./index').Url} */
  const url = {
    id: result.Item.id,
    name: result.Item.name,
    description: result.Item.description,
    target: result.Item.target,
    status: result.Item.status,
  };
  return url;
};

/** @type {import('./index').putUrl} */
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
    if (result.Attributes === undefined) throw new errors.InternalServerError('The dynamodb update request did not return Attributes', { result });
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

/** @type {import('./index').deleteUrl} */
exports.deleteUrl = async (urlId, userId) => {
  const expressionAttributeNames = {
    '#userId': 'userId',
    '#status': 'status',
  };
  const expressionAttributeValues = {
    ':userId': userId,
    ':status': 'DELETED',
  };
  const setUpdateExpressions = [
    '#status=:status',
  ];

  /** @type {import('@aws-sdk/lib-dynamodb').UpdateCommandInput} */
  const updateParams = {
    TableName: config.dynamodb.tableName,
    Key: {
      id: urlId,
    },
    UpdateExpression: `SET ${setUpdateExpressions.join(', ')}`,
    ConditionExpression: '#userId = :userId',
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  };

  try {
    await exports.dbc().send(new UpdateCommand(updateParams));
  } catch (err) {
    if (!(err instanceof ConditionalCheckFailedException)) {
      throw err;
    }
  }
};
