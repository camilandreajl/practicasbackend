import { sessionConfig } from './sessionConfig';

const verifyResolver = (
  resolverName: string,
  type: 'Mutation' | 'Query' | 'Parent'
) => {
  const resolvers = sessionConfig[type];
  const findResolver = resolvers.find((element: any) => {
    if (resolverName == element.name) return element;
  });
  return findResolver;
};

export { verifyResolver };
