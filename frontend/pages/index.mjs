import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('../lib/router/index.js').RenderFunction} */
export default async function render(event, session) {
  return {
    body: readFileSync(`${dirname}/index.html`).toString(),
    headers: {
      'content-type': 'text/html',
    },
    state: {
      head: {
        description: 'Mr. Go, your friendly neighborhood robotic URL shortener',
      },
    },
    session,
  };
}
