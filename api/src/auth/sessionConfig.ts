export const sessionConfig = {
  Parent: [
    { name: 'user', roles: ['Admin'], isPublic: false },
    { name: 'account', roles: ['Admin'], isPublic: false },
    { name: 'sessions', roles: ['Admin'], isPublic: false },
    { name: 'role', roles: ['Admin'], isPublic: false },
    { name: 'users', roles: ['Admin'], isPublic: false },
  ],
  Mutation: [
    // Account
    { name: 'createAccount', roles: ['Admin'], isPublic: false },
    { name: 'updateAccount', roles: ['Admin'], isPublic: false },
    { name: 'upsertAccount', roles: ['Admin'], isPublic: false },
    { name: 'deleteAccount', roles: ['Admin'], isPublic: false },
    // Session
    { name: 'createSession', roles: ['Admin'], isPublic: false },
    { name: 'updateSession', roles: ['Admin'], isPublic: false },
    { name: 'upsertSession', roles: ['Admin'], isPublic: false },
    { name: 'deleteSession', roles: ['Admin'], isPublic: false },
    // User
    { name: 'createUser', roles: ['Admin'], isPublic: false },
    { name: 'updateUser', roles: ['Admin'], isPublic: false },
    { name: 'upsertUser', roles: ['Admin'], isPublic: false },
    { name: 'deleteUser', roles: ['Admin'], isPublic: false },
    // Role
    { name: 'createRole', roles: ['Admin'], isPublic: false },
    { name: 'updateRole', roles: ['Admin'], isPublic: false },
    { name: 'upsertRole', roles: ['Admin'], isPublic: false },
    { name: 'deleteRole', roles: ['Admin'], isPublic: false },
  ],

  Query: [
    // Account
    { name: 'accounts', roles: ['Admin'], isPublic: false },
    { name: 'account', roles: ['Admin'], isPublic: false },
    // Session
    { name: 'sessions', roles: ['Admin'], isPublic: false },
    { name: 'session', roles: ['Admin'], isPublic: false },
    // User
    { name: 'users', roles: ['Admin'], isPublic: false },
    { name: 'user', roles: ['Admin'], isPublic: false },
    // Role
    { name: 'roles', roles: ['Admin'], isPublic: false },
    { name: 'role', roles: ['Admin'], isPublic: false },
    // Export Data As Excel
    {
      name: 'exportDataAsExcel',
      roles: ['Admin'],
    },
  ],
};
