import React, { Component } from "react";
var randomID = require("random-id");

export default class AllTransactions extends Component {

    constructor(props) {
        super(props);

        this.state = {
            editing: {}
        }
    }

    componentWillMount(){
        this.props.subscribeToNewTransactions({
            transactions: this.props.transactions
        });
    }

    static defaultProps = {
        transactions: [],
        onDelete: () => null,
        onEdit: () => null,
    }


    renderOrEditPost = (transaction) => {
        const {editing} = this.state;
        var isCreator = false 

        return ( 


            <tr key={transaction.userId}>
                <td>{
                    transaction.userId.substring(transaction.userId.lastIndexOf('/') + 1)
                }</td>
                <td>{transaction.role}</td>
                <td>{transaction.score}</td>
            </tr>
        );
    }

    render() {
        const {transactions} = this.props;

        return (

            <table width="100%">
                <thead>
                    <tr id = "title"><th colSpan = "3">Top Creators</th></tr>
                    <tr>
                        <th>user</th>
                        <th>role</th>
                        <th>score</th>
                    </tr>
                </thead>
                <tbody>
                    { [].concat(transactions).filter(t => t.role === 'creator').sort((a, b) => b.score - a.score).map(this.renderOrEditPost) }
                
                </tbody>
                <thead>
                    <tr id = "title"><th colSpan = "3">Top Photographers</th></tr>
                    <tr>
                        <th>user</th>
                        <th>role</th>
                        <th>score</th>
                    </tr>
                </thead>
                <tbody>
                    { [].concat(transactions).filter(t => t.role === 'photographer').sort((a, b) => b.score - a.score).map(this.renderOrEditPost) }
                
                </tbody>
            </table>
        );
    }
}