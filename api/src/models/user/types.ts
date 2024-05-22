import { gql } from 'graphql-tag';

export const userTypes = gql`
  #--------------------------User-----------------------
  type User {
    id: ID!
    name: String!
    lastName: String
    email: String!
    emailVerified: Date
    image: String
    identification: String
    account: Account
    sessions: [Session]
    role: Role!
    roleId: String!
    createdAt: Date!
    updatedAt: Date!
  }
  input UserCreateInput {
    name: String!
    lastName: String
    email: String!
    emailVerified: Date
    image: String
    identification: String
    roleId: String!
  }
  input UserWhereUniqueInput {
    id: String!
  }
  input UserUpdateInput {
    name: String
    lastName: String
    email: String
    emailVerified: Date
    image: String
    identification: String
    roleId: String
  }

  type Mutation {
    # User
    createUser(data: UserCreateInput): User
    changePassword(userId: String!): User
    updateUser(where: UserWhereUniqueInput!, data: UserUpdateInput): User
    upsertUser(where: UserWhereUniqueInput!, data: UserCreateInput): User
    deleteUser(where: UserWhereUniqueInput!): User
  }

  type Query {
    # User
    users: [User]
    user(id: String!): User
  }
`;
