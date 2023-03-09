import { RenderFunction } from '../router';

export type MiddleWare = (renderer: RenderFunction) => RenderFunction;
