import { config } from '../lib/config/index.mjs';

export const ELEMENT_NAME = 'edit-url-form';

/** @type {import('@enhance/types').EnhanceElemFn} */
export function element({ html, state }) {
  const error = state.store?.error ?? '';
  const successfullyUpdatedUrl = state.store?.successfullyUpdatedUrl === true;
  const url = /** @type {import('../../src/lib/data/urls/index.js').Url} */ (state.store?.url);

  const title = url.name ? `${url.name} (${url.target})` : url.target;
  const successHtml = successfullyUpdatedUrl
    ? /* html */ `<div class="${ELEMENT_NAME}-success-message" id="success-message">Successfully updated URL</div>`
    : '';
  const errorHtml = error
    ? /* html */ `<div class="${ELEMENT_NAME}-error-message" id="error-message">Error: ${error}</div>`
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
      }
      .${ELEMENT_NAME}-input-label {
        margin: auto;
        margin-right: 0;
      }
      .${ELEMENT_NAME}-input-field {
        all: unset;
        outline: 1px solid ${config.colors.primary};
        background-color: ${config.colors.primaryLight};
        padding: 1rem;
      }
      .${ELEMENT_NAME}-submit-button {
        all: unset;
        grid-column: 1 / 3;
        padding: 1rem;
        background-color: ${config.colors.primary};
        text-align: center;
        cursor: pointer;
      }
      .${ELEMENT_NAME}-submit-button:hover {
        background-color: ${config.colors.primaryHeavy};
      }
      .${ELEMENT_NAME}-success-message {
        text-align: center;
        padding: 1rem;
        background-color: ${config.colors.success};
        width: 100%;
        color: white;
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
    ${successHtml ?? ''}
    <div class="${ELEMENT_NAME}-container">
      <h1 class="${ELEMENT_NAME}-page-title">Edit URL</h1>
      <h2 id="url-title" class="${ELEMENT_NAME}-title">${title}</h2>
      <form action="/urls/${url.id}" method="post" class="${ELEMENT_NAME}-form">
        <label class="${ELEMENT_NAME}-input-label" for="name">Name:</label>
        <input class="${ELEMENT_NAME}-input-field" type="text" id="name" name="name" value="${url.name}">

        <label class="${ELEMENT_NAME}-input-label" for="description">Description:</label>
        <input class="${ELEMENT_NAME}-input-field" type="text" id="description" name="description" value="${url.description}">

        <input type="submit" value="Update URL" class="${ELEMENT_NAME}-submit-button">
      </form>
    </div>
  `;
}
