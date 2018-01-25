import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'

import AllTransactions from './Components/AllTransactions'
import AddTransaction from './Components/AddTransaction'

import AWSAppSyncClient from 'aws-appsync'
import { Rehydrated } from 'aws-appsync-react'
import { AUTH_TYPE } from 'aws-appsync/lib/link/auth-link'
import { graphql, ApolloProvider, compose } from 'react-apollo'
import * as AWS from 'aws-sdk'
import awsconfig from './aws-exports'
import AllTransactionsQuery from './Queries/AllTransactionsQuery'
import NewTransactionMutation from './Queries/NewTransactionMutation'
import NewTransactionsSubscription from './Queries/NewTransactionsSubscription';
import UpdateTransactionMutation from './Queries/UpdateTransactionMutation';



const apiKey = 'da1-OHdvs8Q4QgeMEfTAPDPJcQ';

const client = new AWSAppSyncClient({
  url: 'https://7seeccgqt5guznacn4lyxcue6q.appsync-api.us-west-2.amazonaws.com/graphql',
  region: 'us-west-2',
  auth: {type: AUTH_TYPE.API_KEY, apiKey: apiKey}
})


class App extends Component {

    render() {
        return (
        <div className="App">
            <header className="App-header">
                <h1 className="App-title">Hello, Retail! Scoreboard </h1>
            </header>
            <AllTransactionsWithData/>
        </div>
        );
    }
}


const AllTransactionsWithData = compose(
    graphql(AllTransactionsQuery, {
        options: {
            fetchPolicy: 'cache-and-network'
        },
        props: (props) => {
          return ({
                  
                    transactions: (props.data.allTransaction || {}).transactions,
        
                    subscribeToNewTransactions: params => {
                        props.data.subscribeToMore({
                            document: NewTransactionsSubscription,
                            variables: {},
                            updateQuery: (prev, { subscriptionData: { data : { newTransaction } } }) => 
                            {console.log('HERE ',prev)
                              const allPostvar = ({
                                ...prev,
                                allTransaction: {transactions: [newTransaction, ...prev.allTransaction.transactions.filter(transaction => transaction.userId !== newTransaction.userId)]}
                            }) 
                            console.log("allpostvar", allPostvar)
                            return allPostvar
                          }
                        });
                    }
            })}
}),
   
    graphql(UpdateTransactionMutation, {
        props: (props) => ({
            onEdit: (transaction) => {
                props.mutate({
                variables: { ...transaction, expectedVersion: transaction.version },
                optimisticResponse: () => ({ updateTransaction: { ...transaction, __typename: 'Transaction', version: transaction.version + 1 } }),
                })
            }
        }),
        options: {
            refetchQueries: [{ query: AllTransactionsQuery }],
            update: (dataProxy, { data: { updateTransaction } }) => {
                const query = AllTransactionsQuery;
                const data = dataProxy.readQuery({ query });

                data.transaction = data.transaction.map(transaction => transaction.userId !== updateTransaction.userId ? transaction : { ...updateTransaction });

                dataProxy.writeQuery({ query, data });
            }
        }
    })
    )(AllTransactions);

    const NewTransactionWithData = graphql(NewTransactionMutation, {
    props: (props) => {
      console.log('I AM HERE', props)
      return ({
        onAdd: transaction => {  props.mutate({
            variables: transaction,
            optimisticResponse: () => ({ addTransaction: { ...transaction, __typename: 'Transaction', version: 1 } }),
        }) }
    }) },
    options: {
        refetchQueries: [{ query: AllTransactionsQuery }],
        update: (dataProxy, { data: { addTransaction } }) => {
            const query = AllTransactionsQuery;
            const data = dataProxy.readQuery({ query });
            data.allTransaction.transactions.push(addTransaction);
            dataProxy.writeQuery({ query, data });
        }
    }
})(AddTransaction);

const WithProvider = () => (
    <ApolloProvider client ={client}>
        <Rehydrated>
            <App />
        </Rehydrated>
    </ApolloProvider>
);

export default WithProvider;