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

  const urlListElements = urlList.filter((url) => url.status === 'ACTIVE').map((url) => {
    const shortUrl = `${config.appEndpoint}/go/${url.id}`;
    const editUrl = `${config.appEndpoint}/urls/${url.id}`;
    const title = url.name ? `${url.name} (${url.target})` : url.target;
    return /* html */ `
      <li class="${ELEMENT_NAME}-element" id="${url.id}">
        <div class="${ELEMENT_NAME}-element-content">
          <b>${title}</b>
          <a href="${shortUrl}">${shortUrl}</a>
          ${url.description ? /* html */ `<i class="${ELEMENT_NAME}-element-description">${url.description}</i>` : ''}
        </div>
        <div class="${ELEMENT_NAME}-element-buttons">
          <a class="${ELEMENT_NAME}-element-button ${ELEMENT_NAME}-edit-button" href="${editUrl}">Edit</a>
          <form id="delete-button" class="${ELEMENT_NAME}-element-button-form" action="/urls" method="post">
            <input type="hidden" name="method" value="delete" />
            <input type="hidden" name="id" value="${url.id}" />
            <input class="${ELEMENT_NAME}-element-button ${ELEMENT_NAME}-delete-button" type="submit" value="Delete" />
          </form>
        </div>
      </li>
    `;
  });

  const errorHtml = error
    ? /* html */ `<div id="error-message" class="${ELEMENT_NAME}-error-message">Error: ${error}</div>`
    : '';
  const previousPageHtml = backwardPaginationToken
    ? /* html */ `<a class="pagination-button pagination-button-back" id="previous-page" href="${config.appEndpoint}/urls?${encode({ paginationToken: backwardPaginationToken })}">← Back</a>`
    : '';
  const nextPageHtml = forwardPaginationToken
    ? /* html */ `<a class="pagination-button pagination-button-next" id="next-page" href="${config.appEndpoint}/urls?${encode({ paginationToken: forwardPaginationToken })}">Next →</a>`
    : '';
  return html`
    <style>
      .${ELEMENT_NAME}-container {
        max-width: 768px;
        margin: auto;
      }
      .${ELEMENT_NAME}-page-title {
        text-align: center;
      }
      .${ELEMENT_NAME}-list {
        all: none;
        padding: 0;
      }
      .${ELEMENT_NAME}-element {
        display: grid;
        grid-template-columns: 3fr 1fr;
        padding: 1rem;
        gap: 1rem;
      }
      .${ELEMENT_NAME}-element:hover {
        background-color: ${config.colors.secondary};
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
      .${ELEMENT_NAME}-element-buttons form {
        height: fit-content;
      }
      .${ELEMENT_NAME}-element-button {
        all: unset;
        cursor: pointer;
        height: fit-content;
        padding: 1rem;
        flex-grow: 1;
        margin: 0;
        text-align: center;
      }
      .${ELEMENT_NAME}-edit-button {
        background-color: ${config.colors.warn};
      }
      .${ELEMENT_NAME}-edit-button:hover {
        background-color: ${config.colors.warnHeavy};
      }
      .${ELEMENT_NAME}-delete-button {
        background-color: ${config.colors.danger};
      }
      .${ELEMENT_NAME}-delete-button:hover {
        background-color: ${config.colors.dangerHeavy};
      }
      .${ELEMENT_NAME}-element-button-form {
        flex-grow: 1;
        display: flex;
        margin: 0;
      }

      .pagination-button {
        all: unset;
        background-color: ${config.colors.secondary};
        padding: 1rem;
        margin: 0 1rem 1rem 1rem;
        cursor: pointer;
      }
      .pagination-button:hover {
        background-color: ${config.colors.secondaryHeavy};
      }
      .pagination-button-back {
        float: left;
      }
      .pagination-button-next {
        float: right;
      }

      .${ELEMENT_NAME}-error-message {
        text-align: center;
        padding: 1rem;
        background-color: ${config.colors.error};
        width: 100%;
        color: white;
      }
    </style>
    ${errorHtml ?? ''}
    <h1 id="title" class="${ELEMENT_NAME}-page-title">Your URLs:</h1>
    <div class="${ELEMENT_NAME}-container">
      <ul id="url-list" class="${ELEMENT_NAME}-list">
        ${urlListElements.length > 0 ? urlListElements.join('') : /* html */ `You don't seem to have any URLs, try creating one!`}
      </ul>
      <div class="pagination">
        ${previousPageHtml ?? ''}
        ${nextPageHtml ?? ''}
      </div>
    </div>
  `;
}
