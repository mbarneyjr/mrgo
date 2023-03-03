import { config } from '../lib/config/index.mjs';

export const ELEMENT_NAME = 'navigation-bar';

/**
 * @type {import('@enhance/types').EnhanceElemFn}
 */
export function element({ html, state }) {
  const currentPath = state.store?.path;
  const isAuthenticated = state.store?.session?.idToken && state.store?.session?.accessToken && state.store?.session?.refreshToken;
  const authLink = isAuthenticated
    ? /* html */ `<a class="${ELEMENT_NAME}-link" href="/logout">Log Out</a>`
    : /* html */ `<a class="${ELEMENT_NAME}-link" href="/login">Log In</a>`;
  return html`
    <style>
      .${ELEMENT_NAME}-nav {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        background-color: ${config.colors.nav.normal};
      }
      .${ELEMENT_NAME}-link {
        all: unset;
        cursor: pointer;
        padding: 1rem;
        flex-basis: auto;
        background-color: ${config.colors.nav.normal};
        color: ${config.colors.nav.light};
      }
      .${ELEMENT_NAME}-link:hover {
        background-color: ${config.colors.nav.heavy};
      }
      .${ELEMENT_NAME}-active-nav {
        background-color: ${config.colors.background.normal};
      }
    </style>
    <nav id="navigation" class="${ELEMENT_NAME}-nav">
      <a class="${ELEMENT_NAME}-link ${currentPath === '/' ? `${ELEMENT_NAME}-active-nav` : ''}" href="/">Go Home</a>
      <a class="${ELEMENT_NAME}-link ${currentPath.includes('/urls') ? `${ELEMENT_NAME}-active-nav` : ''}" href="/urls">View URLs</a>
      <a class="${ELEMENT_NAME}-link ${currentPath.includes('/create-url') ? `${ELEMENT_NAME}-active-nav` : ''}" href="/create-url">Create URL</a>
      ${authLink}
    </nav>
  `;
}
