import { gql } from 'graphql-tag';

export const sessionTypes = gql`
  #--------------------------Session-----------------------
  type Session {
    id: ID!
    sessionToken: String!
    expires: Date!
    userId: String!
    user: User!
  }
  input SessionCreateInput {
    sessionToken: String!
    expires: Date!
    userId: String!
  }
  input SessionWhereUniqueInput {
    id: String!
  }
  input SessionUpdateInput {
    sessionToken: String
    expires: Date
    userId: String
  }

  type Mutation {
    # Session
    createSession(data: SessionCreateInput): Session
    updateSession(
      where: SessionWhereUniqueInput!
      data: SessionUpdateInput
    ): Session
    upsertSession(
      where: SessionWhereUniqueInput!
      data: SessionCreateInput
    ): Session
    deleteSession(where: SessionWhereUniqueInput!): Session
  }

  type Query {
    # Session
    sessions: [Session]
    session(id: String!): Session
  }
`;
