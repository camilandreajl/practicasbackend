import { gql } from 'graphql-tag';

export const accountTypes = gql`
  #--------------------------Account-----------------------
  type Account {
    id: ID!
    type: String!
    provider: String!
    providerAccountId: String!
    refresh_token: String
    access_token: String
    expires_at: Int
    token_type: String
    scope: String
    id_token: String
    session_state: String
    oauth_token_secret: String
    oauth_token: String
    userId: String!
    user: User!
  }
  input AccountCreateInput {
    type: String!
    provider: String!
    providerAccountId: String!
    refresh_token: String
    access_token: String
    expires_at: Int
    token_type: String
    scope: String
    id_token: String
    session_state: String
    oauth_token_secret: String
    oauth_token: String
    userId: String!
  }
  input AccountWhereUniqueInput {
    id: String!
  }
  input AccountUpdateInput {
    type: String
    provider: String
    providerAccountId: String
    refresh_token: String
    access_token: String
    expires_at: Int
    token_type: String
    scope: String
    id_token: String
    session_state: String
    oauth_token_secret: String
    oauth_token: String
    userId: String
  }

  type Mutation {
    # Account
    createAccount(data: AccountCreateInput): Account
    updateAccount(
      where: AccountWhereUniqueInput!
      data: AccountUpdateInput
    ): Account
    upsertAccount(
      where: AccountWhereUniqueInput!
      data: AccountCreateInput
    ): Account
    deleteAccount(where: AccountWhereUniqueInput!): Account
  }

  type Query {
    # Account
    accounts: [Account]
    account(id: String!): Account
  }
`;
