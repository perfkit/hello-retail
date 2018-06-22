import React, { Component, PropTypes } from 'react'
import CartList from './cart-list'
import CartDataSource from './cart-data-source'

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
    this.cartItemsLoaded = this.cartItemsLoaded.bind(this)
    this.productsLoaded = this.productsLoaded.bind(this)
  }

  cartItemsLoaded(cartItems) {
    this.setState({
      cartItemsList: cartItems.sort((l, r) => l.name.localeCompare(r.name)),
      cartIDList: 'hi',
    })
  }

  productsLoaded(products) {
    const p = products[0]
    this.setState({
      name: p.name,
      brand: p.brand,
      description: p.description,
      id: p.id,
      image: p.image ? `https://${p.image}` : null,
    })
  }

  render() {
    console.log('HELLO!!!')
    console.log(this)
    console.log(this.state)
    return (
      <div>
        <h3><em>Shopping Cart</em></h3>
        <CartList className="cartList" cartList={this.state.cartItemsList} cookie="hi" />
        {/* <CartList className="cartIDList" cartList */}
        <CartDataSource awsLogin={this.props.awsLogin} cartItemsLoaded={this.cartItemsLoaded} productsLoaded={this.productsLoaded} />
      </div>
    )
  }
}

export default CartPage
