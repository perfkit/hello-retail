import React, { Component, PropTypes } from 'react'
import ValidationErrors from '../validation-errors'
import config from '../../config'

class CartPage extends Component {
  // TODO: DRY up all these duplicate propType declarations everywhere
  static propTypes = {
    awsLogin: PropTypes.shape({
      state: PropTypes.shape({
        profile: PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
        }),
      }),
      makeApiRequest: PropTypes.func,
    }),
  }

  static defaultProps = {
    awsLogin: null,
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div> // TODO: Change this section
      <h1> Shopping Cart </h1>
      </div>
    )
  }
}

export default CartPage
