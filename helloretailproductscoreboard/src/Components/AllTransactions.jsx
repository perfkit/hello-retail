import React, { Component } from 'react'


const defaultProps = {
  transactions: [],
  onDelete: () => null,
  onEdit: () => null,
}

export const sortById = transactions => []
  .concat(transactions)
  .sort((a, b) => b.lastEventId - a.lastEventId)

const render2 = ({ transactions }) => (

  <table width="100%">
    <thead>
      <tr>
        <th>user</th>
        <th>role</th>
        <th>score</th>
      </tr>
    </thead>
    <tbody>
      {sortById(transactions).map(this.renderOrEditPost)}
    </tbody>
  </table>
)

export default class AllTransactions extends Component {
  static renderOrEditPost(transaction) {
    return ({ transaction })
  }

  constructor(props) {
    super(props || defaultProps)
  }

  componentWillMount() {
    this.props.subscribeToNewTransactions({
      transactions: this.props.transactions,
    })

    AllTransactions.propTypes = {
      transactions: React.propTypes.string.isRequired,
      subscribeToNewTransactions: React.propTypes.string.isRequired,
    }
  }

  render() {
    return render2(this.props)
  }
}
