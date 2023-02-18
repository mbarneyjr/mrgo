/**
 * @type {import('@enhance/types').EnhanceElemFn}
 */
export default function MyHeader({ html, state }) {
  const isAuthenticated = state.store?.session?.idToken && state.store?.session?.accessToken && state.store?.session?.refreshToken;
  const authButton = isAuthenticated
    ? /* html */ `<a href=/logout>logout</a>`
    : /* html */ `<a href=/login>login</a>`;
  return html`
    <header>
      <nav>
        <a href=/>home</a>
        ${authButton}
        <a href=/urls>urls</a>
      </nav>
    </header>
  `;
}
