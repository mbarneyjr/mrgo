import { config } from '../lib/config/index.mjs';

export const ELEMENT_NAME = 'navigation-bar';

/**
 * @type {import('@enhance/types').EnhanceElemFn}
 */
export function element({ html, state }) {
  const currentPath = state.store?.path;
  const isAuthenticated = state.store?.session?.idToken && state.store?.session?.accessToken && state.store?.session?.refreshToken;
  const authLink = isAuthenticated
    ? /* html */ `<a class="auth-link" href="/logout">Log Out</a>`
    : /* html */ `<a class="auth-link" href="/login">Log In</a>`;
  return html`
    <style>
      ${ELEMENT_NAME} #navigation {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        background-color: ${config.colors.primary};
      }
      ${ELEMENT_NAME} a {
        text-decoration: none;
        color: black;
        padding: 1rem;
        background-color: ${config.colors.primary};
      }
      ${ELEMENT_NAME} a:hover {
        background-color: ${config.colors.primaryHeavy};
      }
      .auth-link {
        margin-left: auto;
      }
      ${ELEMENT_NAME} a.active-nav {
        background-color: ${config.colors.background};
      }
    </style>
    <nav id="navigation">
      <a href="/" class="${currentPath === '/' ? 'active-nav' : ''}">Go Home</a>
      <a href="/urls" class="${currentPath.includes('/urls') ? 'active-nav' : ''}">View URLs</a>
      <a href="/create-url" class="${currentPath.includes('/create-url') ? 'active-nav' : ''}">Create URL</a>
      ${authLink}
    </nav>
  `;
}
