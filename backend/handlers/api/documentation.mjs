import { readFileSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { apiWrapper } from '../../lib/api/wrapper.mjs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const handler = apiWrapper(async (event) => {
  const queryStringParameters = event.queryStringParameters || {};
  const spec = JSON.parse(readFileSync(path.join(dirname, '../../openapi.packaged.json')).toString());

  spec.info.title = `${process.env.APPLICATION_NAME}-${process.env.ENVIRONMENT_NAME}`;
  spec.info.version = `${process.env.VERSION}`;

  if (queryStringParameters.format === 'json') {
    return spec;
  }

  const html = readFileSync(path.join(dirname, './assets/openapi-template.html')).toString()
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
