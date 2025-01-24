import { gql } from 'graphql-tag';

export const sessionTypes = gql`
  scalar DateTime
  scalar Date
  scalar JSON

  type Session {
    id: ID
    sessionToken: String
    userId: String
    user: User
    expires: DateTime
    createdAt: DateTime
  }

  type Query {
    getSession(id: String!): Session
    getSessions: [Session]
  }

  
`;