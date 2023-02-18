/** @type {import('@enhance/types').EnhanceElemFn} */
export default function CreateUrlForm({ html }) {
  return html`
    <form action="/urls" method="post">
      <input type="hidden" name="method" value="create" />

      <label for="name">Name:</label><br>
      <input type="text" id="name" name="name"><br>

      <label for="description">Description:</label><br>
      <input type="text" id="description" name="description"><br>

      <label for="target">Target:</label><br>
      <input type="text" id="target" name="target"><br>

      <input type="submit" value="Create URL">
    </form>`;
}
