import AWS from 'aws-sdk'
import https from 'https'
import React, { Component, PropTypes } from 'react'
import { browserHistory } from 'react-router'
import ProductDataSource from './product-data-source'
import ValidationErrors from '../validation-errors'
import config from '../../config'

class ProductDetailPage extends Component {
  static propTypes = {
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.productsLoaded = this.productsLoaded.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
    this.addToCart = this.addToCart.bind(this)
    this.state.errors = []
    this.state.buyMessage = null
    this.state.addMessage = null
  }

  makeApiRequest(api, verb, path, data) {
    return new Promise((resolve, reject) => {
      // https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
      const apiPath = `/${config.Stage}${path}`
      const body = JSON.stringify(data)
      const hostname = `${api}.execute-api.${config.AWSRegion}.amazonaws.com`
      const endpoint = new AWS.Endpoint(hostname)
      const request = new AWS.HttpRequest(endpoint)

      request.method = verb
      request.path = apiPath
      request.region = config.AWSRegion
      request.host = endpoint.host
      request.body = body
      request.headers.Host = endpoint.host

      const postRequest = https.request(request, (response) => {
        let result = ''
        response.on('data', (d) => { result += d })
        response.on('end', () => resolve(result))
        response.on('error', error => reject(error))
      })

      postRequest.write(body)
      postRequest.end()
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

  purchaseProduct() {
    this.makeApiRequest(config.EventWriterApi, 'POST', '/event-writer/', {
      schema: 'com.nordstrom/product/purchase/1-0-0',
      id: this.props.params.id,
      origin: `hello-retail/web-client-purchase-product/dummy_id/dummy_name`,
    })
      .then(() => {
        // browserHistory.push('/categories/')
        this.setState({
          buyMessage: 'Order Placed.',
        })
      })
      .catch((error) => {
        // Show error message and re-enable button so user can try again.
        console.log(error)
        this.setState({
          errors: [error],
        })
      })

    this.setState({
      buyMessage: 'Please wait...',
    })
  }

  addToCart() {
    this.makeApiRequest(config.EventWriterApi, 'POST', '/event-writer/', {
      schema: 'com.nordstrom/cart/add/1-0-0',
      id: this.props.params.id,
      origin: `hello-retail/web-client-cart-product/dummy_id/dummy_name`,
    })
      .then(() => {
        this.setState({
          addMessage: 'Added to Cart.',
        })
      })
      .catch((error) => {
        console.log(error)
        this.setState({
          errors: [error],
        })
      })

    this.setState({
      addMessage: 'Adding to Cart ...',
    })
  }

  render() {
    // TODO: Add query for single product by id
    // TODO: Add image

    // let blurb = null
    // if (!this.state.buyMessage) {
    //   blurb = <button onClick={this.purchaseProduct}>Buy</button>
    // } else {
    //   blurb = <h4>{this.state.buyMessage}</h4>
    // }

    let cartBlurb = null
    if (!this.state.addMessage) {
      cartBlurb = <button onClick={this.addToCart}>Add to Cart</button>
    } else {
      cartBlurb = <h4>{this.state.addMessage}</h4>
    }

    const backButtonStyle = {
      margin: '15px',
    }

    console.log(this.state)
    return (
      <div>
        <div>
          <h3>{this.state.brand}</h3>
          <h4>{this.state.name}</h4>
          <div>{this.state.description}</div>
          <div>
            { this.state.image ? (<img className="productImage" src={this.state.image} alt={this.state.name} />) : null }
          </div>
          <br />
          <ValidationErrors errors={this.state.errors} />
          {cartBlurb}
          <ProductDataSource productId={this.props.params.id} productsLoaded={this.productsLoaded} />
          <button style={backButtonStyle} onClick={browserHistory.goBack}>Back to List</button>
        </div>
      </div>
    )
  }
}

export default ProductDetailPage
