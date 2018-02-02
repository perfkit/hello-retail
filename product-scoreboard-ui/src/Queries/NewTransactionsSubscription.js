import gql from 'graphql-tag';

export default gql`
subscription NewTransactionSub {
   newTransaction {
	  __typename
	  created
	  createdBy
	  creator
	  creatorScore
	  lastEventId
	  photographer
	  photograpehrScore
	  productId
	  updated
	  updatedBy
   }
}`;

