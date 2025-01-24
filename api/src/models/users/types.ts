import { gql } from 'graphql-tag';

export const userTypes = gql`
  scalar DateTime
  scalar Date
  scalar JSON

  type User {
    id: ID
    name: String
    email: String
    emailVerified: DateTime
    termsAndConditionsAcceptedAt: DateTime
    position: String
    image: String
    identification: String
    userMonitorings: [UserMonitoring]
    countries: [Country]
    sessions: [Session]
    role: Role
    roleId: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Query {
    getUser(email: String!): User
    getUsers: [User]
    topUsers(
        startDate: DateTime!,
        endDate: DateTime!
    ): [User]
    topUsersByCountry(
        monitoringType: Enum_UserMonitoringType!,
        countryId: String!,
        startDate: DateTime!,
        endDate: DateTime!,
    ): [User]
  }

`;