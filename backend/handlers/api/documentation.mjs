import { readFileSync } from 'fs';
import * as path from 'path';
import { apiWrapper } from '../../lib/api/wrapper.mjs';

export const handler = apiWrapper(async (event) => {
  const queryStringParameters = event.queryStringParameters || {};
  const spec = JSON.parse(readFileSync(path.join(__dirname, '../../openapi.packaged.json')).toString());

  spec.info.title = `${process.env.APPLICATION_NAME}-${process.env.ENVIRONMENT_NAME}`;

  if (queryStringParameters.format === 'json') {
    return spec;
  }

  const html = readFileSync(path.join(__dirname, './assets/openapi-template.html')).toString()
    .replace('$title', spec.info.title)
    .replace('$spec', JSON.stringify(spec));

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: html,
  };
});
