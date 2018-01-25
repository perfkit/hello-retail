import gql from 'graphql-tag'

export default gql`
mutation AddTransactionMutation($userId: ID!, $role: String!, $score: Int) {
    addTransaction(
        userId: $userId
        role: $role
        score: $score
        updated: $updated
        updatedBy: $updatedBy
    ) {
        __typename
        userId
        role
        score
        updated
        updatedBy
    }
}`
