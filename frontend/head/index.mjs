import { config } from '../lib/config/index.mjs';

/**
 * @param {import('aws-lambda').APIGatewayProxyEventV2} event
 * @param {*} state
 * @returns string
 */

/* eslint-disable-next-line no-unused-vars */
export default function Head(event, state) {
  const title = state?.head?.title
    ? `${state.head.title} - Mr. Go`
    : 'Mr. Go';
  const description = state?.head?.description ?? '';
  const devHtml = process.env.LOCAL === 'true'
    ? /* html */ `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`
    : '';
  return /* html */`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="theme-color" content="${config.colors.nav.normal}">
      <meta name="description" content="${description}">
      <title>${title}</title>
      <link rel="icon" href="/static/favicon.ico">
      ${devHtml}
      <style>
        body {
          margin: 0;
          font-family: 'Arial';
          background-color: ${config.colors.background.normal};
        }
        .reset {
          all: unset;
          cursor: default;
        }
        .app-btn {
          padding: 1rem;
          border-radius: 0.35rem 0.35rem 0.35rem 0.35rem;
          box-shadow: 0px 2px 2px 0px black;
        }
        .app-btn:active {
          box-shadow: 0px 0px 0px 0px black;
        }

        .app-btn-primary {
          background-color: ${config.colors.primary.normal};
          color: white;
        }
        .app-btn-primary:hover {
          background-color: ${config.colors.primary.light};
        }
        .app-btn-primary:active {
          background-color: ${config.colors.primary.heavy};
        }

        .app-btn-success {
          background-color: ${config.colors.success.normal};
          color: white;
        }
        .app-btn-success:hover {
          background-color: ${config.colors.success.light};
        }
        .app-btn-success:active {
          background-color: ${config.colors.success.heavy};
        }

        .app-btn-danger {
          background-color: ${config.colors.danger.normal};
          color: white;
        }
        .app-btn-danger:hover {
          background-color: ${config.colors.danger.light};
        }
        .app-btn-danger:active {
          background-color: ${config.colors.danger.heavy};
        }

        .app-card {
          border-radius: 0.35rem 0.35rem 0.35rem 0.35rem;
          box-shadow: 0px 1px 2px 0px black;
          background-color: ${config.colors.background.heavy};
          margin: 1rem;
        }

        .success-message {
          width: 100%;
          text-align: center;
          padding: 1rem;
          background-color: ${config.colors.success.normal};
          color: white;
        }
        .error-message {
          width: 100%;
          text-align: center;
          padding: 1rem;
          background-color: ${config.colors.danger.normal};
          color: white;
        }

        .form-input-field {
          all: unset;
          box-shadow: inset 0px 1px 2px 0px black;
        }
      </style>
    </head>
  `;
}
