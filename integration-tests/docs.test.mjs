import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fetch from 'node-fetch';
import { encode } from 'querystring';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('API Documentation', async () => {
  const apigwBaseUrl = process.env.API_ENDPOINT;
  const apigwEndpoint = `${apigwBaseUrl}/docs`;

  it('should successfully return a text/html http response', async () => {
    const response = await fetch(`${apigwEndpoint}`, {});
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('text/html');
    const body = await response.text();
    expect(body.substring(0, 6)).equals('<html>');
  });

  it('should successfully return a application/json response', async () => {
    const response = await fetch(`${apigwEndpoint}?${encode({ format: 'json' })}`, {});
    expect(response.status).equals(200);
    expect(response.headers.get('content-type')).equals('application/json');
    const body = await response.text();
    expect(() => JSON.parse(body)).to.not.throw('response was not well-formatted json');
    const parsedBody = JSON.parse(body);
    expect(parsedBody).to.haveOwnProperty('openapi');
  });
});
