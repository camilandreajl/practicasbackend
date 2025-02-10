import { gql } from 'graphql-tag';

export const countryTypes = gql`
  scalar DateTime
  scalar Date
  scalar JSON

  type Country {
    id: ID
    name: String
    createdAt: DateTime
    updatedAt: DateTime
    users: [User]
  }

  type Query {
    getCountry(id: String!): Country
    getCountries: [Country]
  }

  
`;