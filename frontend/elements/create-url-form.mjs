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
    </style>
    <div class="${ELEMENT_NAME}-container">
      <h1 class="${ELEMENT_NAME}-page-title">Create URL</h1>
      <form id="create-url-form" action="/urls" method="post" class="${ELEMENT_NAME}-form">
        <input type="hidden" name="method" value="create" />

        <label class="${ELEMENT_NAME}-input-label" for="name">Name:</label>
        <input class="${ELEMENT_NAME}-input-field" type="text" id="name" name="name">

        <label class="${ELEMENT_NAME}-input-label" for="description">Description:</label>
        <input class="${ELEMENT_NAME}-input-field" type="text" id="description" name="description">

        <label class="${ELEMENT_NAME}-input-label" for="target">Target:</label>
        <input class="${ELEMENT_NAME}-input-field" type="text" id="target" name="target">

        <input type="submit" value="Create URL" class="${ELEMENT_NAME}-submit-button">
      </form>
    </div>
    `;
}
