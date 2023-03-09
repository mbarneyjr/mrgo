import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fetch from 'node-fetch';
import { randomUUID } from 'crypto';

import { deleteUser, getUserToken } from './util/auth.mjs';

chai.use(chaiAsPromised);

const { expect } = chai;

const integrationTestId = randomUUID();

describe(`URL management errors [${integrationTestId}]`, async () => {
  let token = '';
  const apigwBaseUrl = process.env.API_ENDPOINT;
  const userPoolId = process.env.USER_POOL_ID;
  const appClientId = process.env.APP_CLIENT_ID;
  const username = `user+${integrationTestId}@mrgo.io`;
  const password = `Ab1!${randomUUID()}`;

  before(async () => {
    token = await getUserToken(userPoolId, appClientId, username, password);
  });

  after(async () => {
    await deleteUser(userPoolId, username);
  });

  it('returns unauthenticated if no authorization header given', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls`);
    expect(response.status).equals(401);
  });

  it('returns validation error if url target not specified on create', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls`, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        name: 'foo',
        description: 'bar',
        target: undefined,
      }),
    });
    expect(response.status).equals(400);
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw(null, 'response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('error');
    expect(parsedBody.error).to.haveOwnProperty('code', 'INVALID_REQUEST', 'unexpected error code');
  });

  it('should not allow you to update a url target', async () => {
    // create the url
    const createResponse = await fetch(`${apigwBaseUrl}/urls`, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        name: 'foo',
        description: 'bar',
        target: 'https://google.com',
      }),
    });
    expect(createResponse.status).equals(200);
    const createBody = await createResponse.text();
    expect(() => JSON.parse(createBody)).to.not.throw(null, 'response was not well-formatted json');
    const createdUrl = JSON.parse(createBody);
    expect(createdUrl).to.haveOwnProperty('id');
    // update the url
    const updateResponse = await fetch(`${apigwBaseUrl}/urls/${createdUrl.id}`, {
      method: 'PUT',
      headers: {
        Authorization: token,
      },
      body: JSON.stringify({
        target: 'https://mrgo.io',
      }),
    });
    expect(updateResponse.status).equals(400);
    const errorBody = await updateResponse.text();
    expect(() => JSON.parse(errorBody)).to.not.throw(null, 'response was not well-formatted json');
    const parsedErrorBody = JSON.parse(errorBody);
    expect(parsedErrorBody).to.haveOwnProperty('error');
    expect(parsedErrorBody.error).to.haveOwnProperty('code', 'INVALID_REQUEST', 'unexpected error code');
    // get the url
    const getResponse = await fetch(`${apigwBaseUrl}/urls/${createdUrl.id}`);
    expect(getResponse.status).equals(200);
    const getBody = await getResponse.text();
    expect(() => JSON.parse(getBody)).to.not.throw(null, 'response was not well-formatted json');
    const getUrl = JSON.parse(getBody);
    expect(getUrl).to.haveOwnProperty('target', 'https://google.com', 'url target was modified, is not the original target');
  });

  it('should not return a 404 when you get a url that doesn not exist', async () => {
    const response = await fetch(`${apigwBaseUrl}/urls/${randomUUID()}`);
    expect(response.status).equals(404);
    const errorBody = await response.text();
    expect(() => JSON.parse(errorBody)).to.not.throw(null, 'response was not well-formatted json');
    const parsedErrorBody = JSON.parse(errorBody);
    expect(parsedErrorBody).to.haveOwnProperty('error');
    expect(parsedErrorBody.error).to.haveOwnProperty('code', 'NOT_FOUND', 'unexpected error code');
  });
});
