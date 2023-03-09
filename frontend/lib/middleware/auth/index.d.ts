import { MiddleWare } from '../index';
import { Session } from '../../session';
import { RenderFunction, RenderResult } from '../../router/index';

export interface LoggedInSession extends Session {
  refreshToken: string
  accessToken: string
  idToken: string
}

export type AuthenticatedRenderFunction  = RenderFunction extends (event: infer E, session: infer S) => infer R ? (event: E, session: LoggedInSession) => R: never;

export function isLoggedIn(session: Session): session is LoggedInSession;
export function sessionNeedsRefresh(session: LoggedInSession): boolean;
export function refreshSession(session: LoggedInSession): Promise<LoggedInSession>;
export function redirectToLogin(session: Session, requestedPath: string): RenderResult;

export type AuthMiddleWare = (renderer: AuthenticatedRenderFunction) => RenderFunction;
