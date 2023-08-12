import { config } from '../lib/config/index.mjs';

export const ELEMENT_NAME = 'navigation-bar';

/**
 * @type {import('@enhance/types').EnhanceElemFn}
 */
export function element({ html, state }) {
  const currentPath = state.store?.path;
  const isAuthenticated = state.store?.session?.idToken && state.store?.session?.accessToken && state.store?.session?.refreshToken;
  const authLink = isAuthenticated
    ? /* html */ `<a class="link" href="/logout">Log Out</a>`
    : /* html */ `<a class="link" href="/login">Log In</a>`;
  return html`
    <style>
      nav-bar {
        display: flex;
        background-color: ${config.colors.nav.normal};
        width: 100%;
      }

      nav-bar a,
      nav-bar::part(toggle) {
        padding: 1rem;
        background-color: ${config.colors.nav.normal};
        color: ${config.colors.background.light};
        text-decoration: none;
      }
      nav-bar::part(toggle-line) {
        background-color: ${config.colors.background.light};
      }

      nav-bar .link:hover {
        background-color: ${config.colors.nav.heavy};
        color: ${config.colors.background.light};
      }

      nav-bar .link.active {
        background-color: ${config.colors.background.light};
        color: ${config.colors.nav.normal};
      }
    </style>
    <nav-bar breakpoint="512px">
      <a href="/" slot="title">Mr. Go</a>
      <a class="link ${currentPath === '/' ? 'active' : ''}" href="/">Go Home</a>
      <a class="link ${currentPath === '/urls' ? 'active' : ''}" href="/urls">View URLs</a>
      <a class="link ${currentPath === '/create-url' ? 'active' : ''}" href="/create-url">Create URL</a>
      ${authLink}
    </nav-bar>
  `;
}
