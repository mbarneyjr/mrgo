import { config } from '../lib/config/index.mjs';

export const ELEMENT_NAME = 'create-url-form';

/** @type {import('@enhance/types').EnhanceElemFn} */
export function element({ html }) {
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
    <div class="${ELEMENT_NAME}-container">
      <h1 class="${ELEMENT_NAME}-page-title">Create URL</h1>
      <form class="app-card ${ELEMENT_NAME}-form" action="/urls" method="post" id="create-url-form">
        <input type="hidden" name="method" value="create" />

        <label class="${ELEMENT_NAME}-input-label" for="name">Name:</label>
        <input class="form-input-field ${ELEMENT_NAME}-input-field" type="text" id="name" name="name">

        <label class="${ELEMENT_NAME}-input-label" for="description">Description:</label>
        <input class="form-input-field ${ELEMENT_NAME}-input-field" type="text" id="description" name="description">

        <label class="${ELEMENT_NAME}-input-label" for="target">Target:</label>
        <input class="form-input-field ${ELEMENT_NAME}-input-field" type="text" id="target" name="target">

        <input class="reset app-btn app-btn-success ${ELEMENT_NAME}-submit-button" type="submit" value="Create URL">
      </form>
    </div>
    `;
}
