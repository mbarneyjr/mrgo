/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {*} state
 * @returns string
 */
/* eslint-disable-next-line no-unused-vars */
export default function Head(event, state) {
  const title = 'Mr. Go';
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      <link rel="icon" href="/static/favicon.ico">
    </head>
  `;
}
