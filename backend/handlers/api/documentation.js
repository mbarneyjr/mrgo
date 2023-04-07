const fs = require('fs');
const path = require('path');
const { apiWrapper } = require('../../lib/api/wrapper');

exports.handler = apiWrapper(async (event) => {
  const queryStringParameters = event.queryStringParameters || {};
  const spec = JSON.parse(fs.readFileSync(path.join(__dirname, '../../openapi.packaged.json')).toString());

  spec.info.title = `${process.env.APPLICATION_NAME}-${process.env.ENVIRONMENT_NAME}`;

  if (queryStringParameters.format === 'json') {
    return spec;
  }

  const html = fs.readFileSync(path.join(__dirname, './assets/openapi-template.html')).toString()
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
