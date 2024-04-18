import gql from 'graphql-tag';

export const generalTypes = gql`
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
`;
