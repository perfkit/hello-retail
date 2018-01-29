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


            <tr key={Math.random()}> //change back to product id when done
                <td>{
                    transaction.productId
                }</td>
                <td>{transaction.role}</td>
                <td>{transaction.score}</td>
            </tr>
        );
    }

    render() {
        const {transactions} = this.props;
        console.log("THIS BE THE PROPS", this.props)

        return (

            <table width="100%">
                <thead>
                    <tr>
                        <th>user</th>
                        <th>role</th>
                        <th>score</th>
                    </tr>
                </thead>
                <tbody>
                    { [].concat(transactions).sort((a, b) => b.lastEventId - a.lastEventId).map(this.renderOrEditPost) }
                
                </tbody>
            </table>
        );
    }
}