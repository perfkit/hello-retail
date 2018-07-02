import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

class CartItem extends Component {
  static propTypes = {
    productId: PropTypes.string.isRequired,
    // createdAt: PropTypes.number.isRequired,
    // updatedAt: PropTypes.number.isRequired,
    // userId: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props)
    this.state = {}
  }

  // TODO: Replace 'id' with this.props.id
  render() {
    return (
      <div>
        <Link
          className="cartItemLink"
          to={`/product/${encodeURIComponent(this.props.productId)}`}
        >
          {this.props.productId}
        </Link>
      </div>
    )
  }
}

export default CartItem
