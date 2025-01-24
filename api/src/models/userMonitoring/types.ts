import { gql } from 'graphql-tag';

export const userMonitoringTypes = gql`
  scalar DateTime
  scalar Date
  scalar JSON

  type UserMonitoring {
    id: ID
    user: User
    createdAt: DateTime
    usage: Int
    description: String
    userId: String
  }

  enum Enum_UserMonitoringType {
    signIn
    print
    share
  }

  type Query {
    getUserMonitorings(
        email: String!,
        startDate: DateTime!,
        endDate: DateTime!,
    ): [UserMonitoring]
  }

  
`;