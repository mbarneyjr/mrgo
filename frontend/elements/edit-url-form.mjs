import { config } from '../lib/config/index.mjs';

export const ELEMENT_NAME = 'edit-url-form';

/** @type {import('@enhance/types').EnhanceElemFn} */
export function element({ html, state }) {
  const error = state.store?.error ?? '';
  const successfullyUpdatedUrl = state.store?.successfullyUpdatedUrl === true;
  const url = /** @type {import('../../backend/lib/data/urls/index.js').Url} */ (state.store?.url);

  const title = url.name ? `${url.name} (${url.target})` : url.target;
  const successHtml = successfullyUpdatedUrl
    ? /* html */ `<div class="success-message" id="success-message">Successfully updated URL</div>`
    : '';
  const errorHtml = error
    ? /* html */ `<div class="error-message" id="error-message">Error: ${error}</div>`
    : '';

  return html`
    <style>
      .${ELEMENT_NAME}-container {
        max-width: 768px;
        margin: auto;
        padding: 1rem;
      }
      .${ELEMENT_NAME}-page-title {
        text-align: center;
      }
      .${ELEMENT_NAME}-form {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1rem;
        padding: 1rem;
      }
      .${ELEMENT_NAME}-input-label {
        margin: auto;
        margin-right: 0;
      }
      .${ELEMENT_NAME}-input-field {
        background-color: ${config.colors.background.light};
        padding: 1rem;
      }
      .${ELEMENT_NAME}-submit-button {
        grid-column: 1 / 3;
        padding: 1rem;
        text-align: center;
      }
    </style>
    ${errorHtml ?? ''}
    ${successHtml ?? ''}
    <div class="${ELEMENT_NAME}-container">
      <h1 class="${ELEMENT_NAME}-page-title">Edit URL</h1>
      <h2 id="url-title" class="${ELEMENT_NAME}-title">${title}</h2>
      <form class="app-card ${ELEMENT_NAME}-form" action="/urls/${url.id}" method="post">
        <label class="${ELEMENT_NAME}-input-label" for="name">Name:</label>
        <input class="form-input-field ${ELEMENT_NAME}-input-field" type="text" id="name" name="name" value="${url.name}">

        <label class="${ELEMENT_NAME}-input-label" for="description">Description:</label>
        <input class="form-input-field ${ELEMENT_NAME}-input-field" type="text" id="description" name="description" value="${url.description}">

        <label class="${ELEMENT_NAME}-input-label" for="status">Status:</label>
        <select class="form-input-select ${ELEMENT_NAME}-input-field" name="status" id="status">
          <option value="ACTIVE" ${url.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
          <option value="INACTIVE" ${url.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
        </select>
        <input class="reset app-btn app-btn-success ${ELEMENT_NAME}-submit-button" type="submit" value="Update URL">
      </form>
    </div>
  `;
}
