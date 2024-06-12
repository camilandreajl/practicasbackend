import { Context, Enum_ResolverType, ResolverFunction } from '@/types';
import { checkSession } from './checkSession';

const withSessionCheck = (
  resolver: ResolverFunction,
  resolverName: string,
  resolverType: Enum_ResolverType
) => {
  return async (parent: unknown, args: unknown, context: Context) => {
    const check = await checkSession({
      session: context.session,
      resolverName,
      resolverType,
    });

    if (check?.auth) {
      return resolver(parent, args, context);
    } else {
      return Error(check?.error);
    }
  };
};

export { withSessionCheck };
