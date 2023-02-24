/** @type {import('@enhance/types').EnhanceElemFn} */
export default function EditUrlForm({ html, state }) {
  const error = state.store?.error ?? '';
  const successfullyUpdatedUrl = state.store?.successfullyUpdatedUrl === true;
  const url = /** @type {import('../../src/lib/data/urls/index.js').Url} */ (state.store?.url);
  const successHtml = successfullyUpdatedUrl
    ? /* html */ `<span id="success-message">Successfully updated URL</span>`
    : '';
  const errorHtml = error
    ? /* html */ `<span id="error-message">Error: ${error}</span>`
    : '';

  return html`
    ${errorHtml ?? ''}
    ${successHtml ?? ''}
    <form action="/urls/${url.id}" method="post">
      <!-- <input type="hidden" name="target" value="${url.target}" /> -->

      <label for="name">Name:</label><br>
      <input type="text" id="name" name="name" value="${url.name}"><br>

      <label for="description">Description:</label><br>
      <input type="text" id="description" name="description" value="${url.description}"><br>

      <input type="submit" value="Update URL">
    </form>`;
}
