import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

class CartItem extends Component {
  static propTypes = {
    cartItemName: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    console.log(this.props)
    return (
      <div>
        <Link
          className="cartItemLink"
          to={`/product/${encodeURIComponent(this.props.id)}`}
        >
          {this.props.cartItemName}
        </Link>
      </div>
    )
  }
}

export default CartItem
