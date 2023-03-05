import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

import { deleteUser, getUserToken } from './util/auth.mjs';

chai.use(chaiAsPromised);

const { expect } = chai;

const integrationTestId = randomUUID();

describe.only(`URL management [${integrationTestId}]`, async () => {
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
    expect(() => JSON.parse(body)).to.not.throw('response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('id');
    expect(parsedBody?.target).to.equal('https://google.com', 'expected url target not found');
    expect(parsedBody?.name).to.equal('foo', 'expected url name not found');
    expect(parsedBody?.description).to.equal('bar', 'expected url description not found');
    expect(parsedBody?.status).to.equal('ACTIVE', 'expected url status not found');
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
    expect(() => JSON.parse(body)).to.not.throw('response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('urls');
    expect(parsedBody.urls).to.be.instanceOf(Array);
    const createdUrl = parsedBody.urls.find((url) => url.id === createdUrlId);
    expect(createdUrl?.id).to.equal(createdUrlId, 'expected url id not found');
    expect(createdUrl?.target).to.equal('https://google.com', 'expected url target not found');
    expect(createdUrl?.name).to.equal('foo', 'expected url name not found');
    expect(createdUrl?.description).to.equal('bar', 'expected url description not found');
    expect(createdUrl?.status).to.equal('ACTIVE', 'expected url status not found');
  });

  it('can get URL directly', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls/${createdUrlId}`, {
      headers: {
        Authorization: token,
      },
    });
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw('response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody?.id).to.equal(createdUrlId, 'expected url id not found');
    expect(parsedBody?.target).to.equal('https://google.com', 'expected url target not found');
    expect(parsedBody?.name).to.equal('foo', 'expected url name not found');
    expect(parsedBody?.description).to.equal('bar', 'expected url description not found');
    expect(parsedBody?.status).to.equal('ACTIVE', 'expected url status not found');
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
    expect(() => JSON.parse(body)).to.not.throw('response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody?.id).to.equal(createdUrlId, 'expected url id not found');
    expect(parsedBody?.target).to.equal('https://google.com', 'expected url target not found');
    expect(parsedBody?.name).to.equal('foo', 'expected url name not found');
    expect(parsedBody?.description).to.equal('baz', 'expected url description not found');
    expect(parsedBody?.status).to.equal('ACTIVE', 'expected url status not found');
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
    expect(() => JSON.parse(body)).to.not.throw('response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody?.id).to.equal(createdUrlId, 'expected url id not found');
    expect(parsedBody?.target).to.equal('https://google.com', 'expected url target not found');
    expect(parsedBody?.name).to.equal('foo', 'expected url name not found');
    expect(parsedBody?.description).to.equal('baz', 'expected url description not found');
    expect(parsedBody?.status).to.equal('ACTIVE', 'expected url status not found');
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
    expect(() => JSON.parse(body)).to.not.throw('response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('urls');
    expect(parsedBody.urls).to.be.instanceOf(Array);
    const createdUrl = parsedBody.urls.find((url) => url.id === createdUrlId);
    expect(createdUrl).to.equal(undefined, `unexpected url returned in GET /urls (${createdUrlId})`);
  });
});
