import gql from 'graphql-tag';

export default gql`
subscription NewTransactionSub {
   newTransaction {
	  __typename
	  userId
	  role
	  score
	  updated
	  updatedBy
   }
}`;

