import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

class CartItem extends Component {
  static propTypes = {
    cartItemName: PropTypes.string.isRequired,
  };

  static defaultProps = {
    id: 0,
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  // TODO: Replace 'id' with this.props.id
  render() {
    console.log(this.props)
    return (
      <div>
        <Link
          className="cartItemLink"
          to={`/product/${encodeURIComponent('id')}`}
        >
          {this.props.cartItemName}
        </Link>
      </div>
    )
  }
}

export default CartItem
