import gql from 'graphql-tag'

export default gql`
mutation UpdateTransactionMutation($userId: ID!, $role: String!, $score: Int) {
    updateTransaction(
        userId: $userId
        role: $role
        score: $score
        updated: ""
        updatedBy: ""
    ) {
        __typename
        userId
        role
        score
        updated
        updatedBy
    }
}`
