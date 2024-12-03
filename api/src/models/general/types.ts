import gql from 'graphql-tag';

export const generalTypes = gql`
  scalar DateTime
  scalar Date
  scalar JSON

  directive @client_metadata(
    name: String
    filterable: Boolean = false
    orderable: Boolean = false
    searchable: Boolean = false
    hidden: Boolean = false
    exportable: Boolean = true
  ) on FIELD

  scalar Date

  input StringFilter {
    equals: String
    contains: String
    in: [String!]
    notIn: [String!]
    lt: String
    lte: String
    gt: String
    gte: String
    startsWith: String
    endsWith: String
    mode: String
  }

  input DateFilter {
    equals: String # Filter for exact match
    lt: String # Filter for less than
    lte: String # Filter for less than or equal to
    gt: String # Filter for greater than
    gte: String # Filter for greater than or equal to
  }

  enum OrderByDirection {
    asc # Ascending order
    desc # Descending order
  }

  type PresignedURL {
    fileName: String
    url: String
  }

  input ExcelHeaderInput {
    key: String!
    title: String!
  }

  type ExcelExportResponse {
    url: String!
    message: String!
    error: Boolean!
  }

  type Query {
    getSignedUrlForUpload(file: String): PresignedURL
    getSignedUrlsForFolder(folderPath: String): [PresignedURL]
    getMultipleSignedUrlsForUpload(files: [String]): [PresignedURL]
    exportDataAsExcel(
      headers: [ExcelHeaderInput!]!
      data: JSON!
      path: String!
    ): ExcelExportResponse!
  }
`;
