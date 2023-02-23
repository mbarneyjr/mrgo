import { encode } from 'querystring';
import { config } from '../lib/config/index.mjs';

/** @type {import('@enhance/types').EnhanceElemFn} */
export default function UrlList({ html, state }) {
  /** @type {import('../../src/lib/data/urls/index.js').Url[]} */
  const error = state.store?.error ?? '';
  const urlList = state.store?.urls ?? [];
  const forwardPaginationToken = state.store?.forwardPaginationToken ?? undefined;
  const backwardPaginationToken = state.store?.backwardPaginationToken ?? undefined;

  const urlListElements = urlList.filter((url) => url.status === 'ACTIVE').map((url) => {
    const shortUrl = `${config.appEndpoint}/go/${url.id}`;
    const title = url.name ? `${url.name} (${url.target})` : url.target;
    return /* html */ `
      <li id="${url.id}">
        <div>${title} - <a href="${shortUrl}">${shortUrl}</a></div>
        ${url.description ? /* html */ `<i>${url.description}</i>` : ''}
        <form action="/urls" method="post">
          <input type="hidden" name="method" value="delete" />
          <input type="hidden" name="id" value="${url.id}" />
          <input type="submit" value="Delete" />
        </form>
      </li>
    `;
  });

  const errorHtml = error
    ? /* html */ `<span id="error-message">Error: ${error}</span>`
    : '';
  const previousPageHtml = backwardPaginationToken
    ? /* html */ `<a id="previous-page" href="${config.appEndpoint}/urls?${encode({ paginationToken: backwardPaginationToken })}">← Previous Page</a>`
    : '';
  const nextPageHtml = forwardPaginationToken
    ? /* html */ `<a id="next-page" href="${config.appEndpoint}/urls?${encode({ paginationToken: forwardPaginationToken })}">Next Page →</a>`
    : '';
  return html`
    ${errorHtml ?? ''}
    <ul id="url-list">
      ${urlListElements.join('')}
    </ul>
    ${previousPageHtml ?? ''}
    ${nextPageHtml ?? ''}
  `;
}
