import { encode } from 'querystring';
import { config } from '../lib/config/index.mjs';

export const ELEMENT_NAME = 'url-list';

/** @type {import('@enhance/types').EnhanceElemFn} */
export function element({ html, state }) {
  /** @type {import('../../src/lib/data/urls/index.js').Url[]} */
  const error = state.store?.error ?? '';
  const urlList = /** @type {Array<import('../../src/lib/data/urls/index.js').Url>} */ (state.store?.urls ?? []);
  const forwardPaginationToken = state.store?.forwardPaginationToken ?? undefined;
  const backwardPaginationToken = state.store?.backwardPaginationToken ?? undefined;

  const urlListElements = urlList.map((url) => {
    const shortUrl = `${config.appEndpoint}/go/${url.id}`;
    const editUrl = `${config.appEndpoint}/urls/${url.id}`;
    const title = url.name ? `${url.name} (${url.target})` : url.target;
    return /* html */ `
      <li class="${ELEMENT_NAME}-element ${ELEMENT_NAME}-${url.status === 'ACTIVE' ? 'active' : 'inactive'} app-card" id="${url.id}">
        <div class="${ELEMENT_NAME}-element-content">
          <b>${title}</b>
          <a href="${shortUrl}">${shortUrl}</a>
          ${url.description ? /* html */ `<i class="${ELEMENT_NAME}-element-description">${url.description}</i>` : ''}
        </div>
        <div class="${ELEMENT_NAME}-element-buttons">
          <a class="reset app-btn app-btn-success ${ELEMENT_NAME}-element-button" href="${editUrl}">Edit</a>
          <form class="${ELEMENT_NAME}-form" action="/urls" method="post">
            <input type="hidden" name="method" value="delete" />
            <input type="hidden" name="id" value="${url.id}" />
            <input class="reset app-btn app-btn-danger ${ELEMENT_NAME}-element-button" type="submit" value="Delete" />
          </form>
        </div>
      </li>
    `;
  });

  const errorHtml = error
    ? /* html */ `<div class="error-message" id="error-message">Error: ${error}</div>`
    : '';
  const previousPageHtml = backwardPaginationToken
    ? /* html */ `<a class="reset app-btn app-btn-primary" id="previous-page" href="${config.appEndpoint}/urls?${encode({ paginationToken: backwardPaginationToken })}">← Back</a>`
    : '<div></div>';
  const nextPageHtml = forwardPaginationToken
    ? /* html */ `<a class="reset app-btn app-btn-primary" id="next-page" href="${config.appEndpoint}/urls?${encode({ paginationToken: forwardPaginationToken })}">Next →</a>`
    : '<div></div>';

  return html`
    <style>
      .${ELEMENT_NAME}-container {
        max-width: 768px;
        margin: auto;
      }
      .${ELEMENT_NAME}-page-title {
        text-align: center;
      }
      .${ELEMENT_NAME}-element {
        display: grid;
        grid-template-columns: 3fr 1fr;
        padding: 1rem;
        gap: 1rem;
      }
      .${ELEMENT_NAME}-element:hover {
        background-color: ${config.colors.background.light};
      }

      .${ELEMENT_NAME}-element-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-content: flex-start;
      }
      .${ELEMENT_NAME}-element-content {
        word-break: break-all;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        gap: 1rem;
      }
      .${ELEMENT_NAME}-element-description {
        word-break: keep-all;
      }
      .${ELEMENT_NAME}-element-button {
        height: fit-content;
        padding: 1rem;
        flex-grow: 1;
        margin: 0;
        text-align: center;
      }
      .${ELEMENT_NAME}-form {
        flex-grow: 1;
        display: flex;
      }

      .${ELEMENT_NAME}-active {
        background-color: ${config.colors.background.normal};
      }

      .${ELEMENT_NAME}-inactive {
        color: ${config.colors.nav.light};
      }

      .pagination {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 1rem;
      }
    </style>
    ${errorHtml ?? ''}
    <h1 class="${ELEMENT_NAME}-page-title" id="title">Your URLs:</h1>
    <div class="${ELEMENT_NAME}-container">
      <ul class="reset" id="url-list">
        ${urlListElements.length > 0 ? urlListElements.join('') : /* html */ `You don't seem to have any URLs, try creating one!`}
      </ul>
      <div class="pagination">
        ${previousPageHtml}
        ${nextPageHtml}
      </div>
    </div>
  `;
}
