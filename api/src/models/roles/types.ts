import { gql } from 'graphql-tag';

export const roleTypes = gql`
  scalar DateTime
  scalar Date
  scalar JSON

  type Role {
    id: ID
    name: Enum_RoleName
    createdAt: DateTime
    updatedAt: DateTime
    users: [User]
  }

  enum Enum_RoleName {
    Admin
    Manager
    User
  }

  type Query {
    getRole(id: String!): Role
    getRoles: [Role]
  }

  
`;