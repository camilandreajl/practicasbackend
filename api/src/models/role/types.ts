import { gql } from 'graphql-tag';

export const roleTypes = gql`
  #--------------------------Role-----------------------
  type Role {
    id: ID!
    name: Enum_RoleName!
    users: [User]
    createdAt: Date!
    updatedAt: Date!
  }
  input RoleCreateInput {
    name: Enum_RoleName!
  }
  input RoleWhereUniqueInput {
    id: String!
  }
  input RoleUpdateInput {
    name: Enum_RoleName
  }

  enum Enum_RoleName {
    Admin
  }

  type Mutation {
    # Role
    createRole(data: RoleCreateInput): Role
    updateRole(where: RoleWhereUniqueInput!, data: RoleUpdateInput): Role
    upsertRole(where: RoleWhereUniqueInput!, data: RoleCreateInput): Role
    deleteRole(where: RoleWhereUniqueInput!): Role
  }

  type Query {
    # Role
    roles: [Role]
    role(id: String!): Role
  }
`;
