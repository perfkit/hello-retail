import React, {Component} from 'react'
import CartList from './cart-list'
import CartDataSource from './cart-data-source'

class CartPage extends Component {

  static propTypes = {
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.cartItemsLoaded = this.cartItemsLoaded.bind(this)
  }

  cartItemsLoaded(cartItems) {
    this.setState({
      cartItemsList: cartItems,
    })
  }

  render() {
    return (
      <div>
        <h3 className="cartTitle"><em>Shopping Cart</em></h3>
        <CartList className="cartList" userId={this.props.params.id} cartList={this.state.cartItemsList} />
        <CartDataSource userId={this.props.params.id} cartItemsLoaded={this.cartItemsLoaded} />
      </div>
    )
  }
}

export default CartPage
