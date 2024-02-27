import { verifyResolver } from './verifyResolver';

const checkSession = async (event: any) => {
  const { session, resolverName, resolverType } = event;
  const res = verifyResolver(resolverName, resolverType);

  if (!res) return { error: 'Resolver not configured' };
  if (res?.isPublic) return { auth: true };

  if (!session) return { error: 'Session does not exist' };
  if (session?.expires < new Date()) return { error: 'Session expired' };

  //check roles
  return res?.roles.some((r) => r === session.user.role.name)
    ? { auth: true }
    : { error: 'Unauthorized operation' };
};

export { checkSession };
