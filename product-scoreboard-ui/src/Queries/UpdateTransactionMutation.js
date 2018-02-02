import gql from 'graphql-tag'

export default gql`
mutation UpdateTransactionMutation($created: Int, $createdBy: String, $creator: String) {
    updateTransaction(
        created: $created
        createdBy: $createdBy
        creator: $creator
        creatorScore: $creatorScore
        lastEventId: $lastEventId
        photographer: $photographer
        photographerScore: $photographerScore
        productId: $productId
        updated: $updated
        updatedBy: $updatedBy
    ) {
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
}`
