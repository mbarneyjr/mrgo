import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

import { deleteUser, getUserToken } from './util/auth.mjs';

chai.use(chaiAsPromised);

const { expect } = chai;

const integrationTestId = randomUUID();

describe(`URL management [${integrationTestId}]`, async () => {
  let token = '';
  const apigwBaseUrl = process.env.API_ENDPOINT;
  const userPoolId = process.env.USER_POOL_ID;
  const appClientId = process.env.APP_CLIENT_ID;
  const username = `user+${integrationTestId}@mrgo.io`;
  const password = `Ab1!${randomUUID()}`;

  let createdUrlId;

  before(async () => {
    token = await getUserToken(userPoolId, appClientId, username, password);
  });

  after(async () => {
    await deleteUser(userPoolId, username);
  });

  it('create a URL', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls`, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        target: 'https://google.com',
        name: 'foo',
        description: 'bar',
      }),
    });
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw(null, 'response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('id');
    expect(parsedBody).to.haveOwnProperty('target', 'https://google.com', 'expected url target not found');
    expect(parsedBody).to.haveOwnProperty('name', 'foo', 'expected url name not found');
    expect(parsedBody).to.haveOwnProperty('description', 'bar', 'expected url description not found');
    expect(parsedBody).to.haveOwnProperty('status', 'ACTIVE', 'expected url status not found');
    createdUrlId = parsedBody.id;
  });

  it('can find created URL in list', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls`, {
      headers: {
        Authorization: token,
      },
    });
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw(null, 'response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('urls');
    expect(parsedBody.urls).to.be.instanceOf(Array);
    const createdUrl = parsedBody.urls.find((url) => url.id === createdUrlId);
    expect(createdUrl).to.haveOwnProperty('id', createdUrlId, 'expected url id not found');
    expect(createdUrl).to.haveOwnProperty('target', 'https://google.com', 'expected url target not found');
    expect(createdUrl).to.haveOwnProperty('name', 'foo', 'expected url name not found');
    expect(createdUrl).to.haveOwnProperty('description', 'bar', 'expected url description not found');
    expect(createdUrl).to.haveOwnProperty('status', 'ACTIVE', 'expected url status not found');
  });

  it('can get URL directly', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls/${createdUrlId}`);
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw(null, 'response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('id', createdUrlId, 'expected url id not found');
    expect(parsedBody).to.haveOwnProperty('target', 'https://google.com', 'expected url target not found');
    expect(parsedBody).to.haveOwnProperty('name', 'foo', 'expected url name not found');
    expect(parsedBody).to.haveOwnProperty('description', 'bar', 'expected url description not found');
    expect(parsedBody).to.haveOwnProperty('status', 'ACTIVE', 'expected url status not found');
  });

  it('can update URL', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls/${createdUrlId}`, {
      method: 'PUT',
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        description: 'baz',
      }),
    });
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw(null, 'response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('id', createdUrlId, 'expected url id not found');
    expect(parsedBody).to.haveOwnProperty('target', 'https://google.com', 'expected url target not found');
    expect(parsedBody).to.haveOwnProperty('name', 'foo', 'expected url name not found');
    expect(parsedBody).to.haveOwnProperty('description', 'baz', 'expected url description not found');
    expect(parsedBody).to.haveOwnProperty('status', 'ACTIVE', 'expected url status not found');
  });

  it('can get updated URL', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls/${createdUrlId}`, {
      headers: {
        Authorization: token,
      },
    });
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw(null, 'response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('id', createdUrlId, 'expected url id not found');
    expect(parsedBody).to.haveOwnProperty('target', 'https://google.com', 'expected url target not found');
    expect(parsedBody).to.haveOwnProperty('name', 'foo', 'expected url name not found');
    expect(parsedBody).to.haveOwnProperty('description', 'baz', 'expected url description not found');
    expect(parsedBody).to.haveOwnProperty('status', 'ACTIVE', 'expected url status not found');
  });

  it('can delete URL', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls/${createdUrlId}`, {
      method: 'DELETE',
      headers: {
        Authorization: token,
      },
    });
    expect(response.status).equals(200);
  });

  it('can no longer find deleted URL in list', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls`, {
      headers: {
        Authorization: token,
      },
    });
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw(null, 'response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('urls');
    expect(parsedBody.urls).to.be.instanceOf(Array);
    const createdUrl = parsedBody.urls.find((url) => url.id === createdUrlId);
    expect(createdUrl).to.equal(undefined, `unexpected url returned in GET /urls (${createdUrlId})`);
  });

  it('can no longer get the URL durectly', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls/${createdUrlId}`);
    expect(response.status).equals(404);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw(null, 'response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('error');
    expect(parsedBody.error).to.haveOwnProperty('code', 'NOT_FOUND');
  });
});