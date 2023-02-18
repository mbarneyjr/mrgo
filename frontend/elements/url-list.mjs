import { config } from '../lib/config/index.mjs';

/** @type {import('@enhance/types').EnhanceElemFn} */
export default function UrlList({ html, state }) {
  /** @type {import('../../src/lib/data/urls/index.js').Url[]} */
  const urlList = state.store?.urls || [];
  const error = state.store?.error || '';
  const urlListElements = urlList.filter((url) => url.status === 'ACTIVE').map((url) => /* html */ `
    <li>
      <div><a href="${url.target}">${url.name}</a> - ${config.appEndpoint}/go/${url.id}</div>
      <i>${url.description}</i>
      <form action="/urls" method="post">
        <input type="hidden" name="method" value="delete" />
        <input type="hidden" name="id" value="${url.id}" />
        <input type="submit" value="Delete" />
      </form>
    </li>
  `) || [];

  const errorHtml = error
    ? /* html */ `<pre>Error: ${error}</pre>`
    : '';
  return html`
    <div>
      ${errorHtml}
    </div>
    <ul>
      ${urlListElements.join('')}
    </ul>
  `;
}
