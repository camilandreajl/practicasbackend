import { corsMiddleware } from './cors';
import { sessionMiddleware } from './session';

export const middlewareFunctions = [corsMiddleware, sessionMiddleware];
