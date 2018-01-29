import gql from 'graphql-tag'

export default gql`
query AllTransactions {
    allTransaction {
    	transactions {
	        __typename
	        userId
	        role
	        score
	        updated
	        updatedBy
    	}

    	__typename
    }
}`
