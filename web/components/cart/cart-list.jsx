import React, { Component, PropTypes } from 'react'
import CartItem from './cart-item'
import CartDataSource from './cart-data-source'

class CartList extends Component {
  static propTypes = {
    cartList: PropTypes.arrayOf(React.PropTypes.object),
  }

  static defaultProps = {
    cartList: [],
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    console.log("CartList")
    console.log(this.props)
    console.log(this.props.cartList)
    if (!this.props.cartList) {
      return null
    }

    return (
      <div>
        {
          this.props.cartList.map(cart => (
            <CartItem className="cartItem" cartItemName={cart.name} key={cart.name}/>
          ))
        }
      </div>
    )
  }
}

export default CartList
