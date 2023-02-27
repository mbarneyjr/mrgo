/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {*} state
 * @returns string
 */

import { config } from '../lib/config/index.mjs';

/* eslint-disable-next-line no-unused-vars */
export default function Head(event, state) {
  const title = 'Mr. Go';
  const devHtml = process.env.LOCAL === 'true'
    ? /* html */ `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`
    : '';
  return /* html */`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      <link rel="icon" href="/static/favicon.ico">
      ${devHtml}
      <style>
        html body {
          margin: 0;
          font-family: 'Arial';
          color: black;
          background-color: ${config.colors.background}
        }
      </style>
    </head>
  `;
}
