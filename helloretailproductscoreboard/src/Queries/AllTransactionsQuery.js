import gql from 'graphql-tag'

export default gql`
query AllTransaction {
    allTransaction {
    	transactions {
	        __typename
	        created
	        createdBy
	        creator
	        creatorScore
	        lastEventId
	        photographer
	        photographerScore
	        productId
	        updated
	        updatedBy
    	}

    	__typename
    }
}`
