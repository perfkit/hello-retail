import AWS from 'aws-sdk'
import https from 'https'
import React, {Component} from 'react'
import ValidationErrors from '../validation-errors'
import config from '../../config'

class NewProductPage extends Component {

  constructor(props) {
    super(props)

    this.categoryChange = this.handleProductChange.bind(this, 'category')
    this.nameChange = this.handleProductChange.bind(this, 'name')
    this.brandChange = this.handleProductChange.bind(this, 'brand')
    this.descriptionChange = this.handleProductChange.bind(this, 'description')
    this.validateProduct = this.validateProduct.bind(this)
    this.resetProduct = this.resetProduct.bind(this)
    this.createProduct = this.createProduct.bind(this)
    this.ackCreateProduct = this.ackCreateProduct.bind(this)

    this.emptyProduct = {
      category: '',
      name: '',
      brand: '',
      description: '',
    }

    this.state = this.emptyProduct
    this.state.submittedProduct = false
    this.state.errors = []
  }

  validateProduct(property, value) {
    const product = this.state

    // Quick fix-up of changed property, not yet reflected in actual state.
    product[property] = value

    this.setState({
      // Just need to have at least one alphanumeric in each field
      isProductValid: (
        product.category && product.category.match(/^[\w\d]+/)
        && product.name && product.name.match(/^[\w\d]+/)
        && product.brand && product.brand.match(/^[\w\d]+/)
        && product.description && product.description.match(/^[\w\d]+/)
      ),
    })
  }

  resetProduct() {
    this.setState({
      submittedProduct: true,
      category: '',
      name: '',
      brand: '',
      description: '',
    })
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

  createProduct() {
    const product = this.state

    // Disable "Add Product" button while request is in flight
    this.setState({
      isProductValid: false,
    })

    this.makeApiRequest(config.EventWriterApi, 'POST', '/event-writer/', {
      schema: 'com.nordstrom/product/create/1-0-0',
      id: (`0000000${Math.floor(Math.abs(Math.random() * 10000000))}`).substr(-7),
      origin: `hello-retail/web-client-create-product/dummy_id/dummy_name`,
      category: product.category.trim(),
      name: product.name.trim(),
      brand: product.brand.trim(),
      description: product.description.trim(),
    })
    .then(this.resetProduct)
    .catch((error) => {
      // Show error message and re-enable button so user can try again.
      this.setState({
        isProductValid: true,
        errors: [error],
      })
    })
  }

  ackCreateProduct() {
    this.resetProduct()
    this.setState({
      submittedProduct: false,
    })
  }

  handleProductChange(property, event) {
    this.setState({
      [property]: event.target.value,
    })

    this.validateProduct(property, event.target.value)
  }

  render() {
    if (this.state.submittedProduct) {
      return (
        <div>
          <h2>Product {this.state.name} has been created!</h2>
          <button onClick={this.ackCreateProduct}>Add More</button>
        </div>
      )
    }

    return (
      <div>
        <h3><em>Create New Product</em></h3>
        <div>
          <label>
            Category:<br />
            <input value={this.state.category} onChange={this.categoryChange} />
          </label>
        </div>
        <div>
          <label>
            Name:<br />
            <input value={this.state.name} onChange={this.nameChange} />
          </label>
        </div>
        <div>
          <label>
            Brand:<br />
            <input value={this.state.brand} onChange={this.brandChange} />
          </label>
        </div>
        <div>
          <label>
            Description:<br />
            <textarea rows="10" value={this.state.description} onChange={this.descriptionChange} />
          </label>
        </div>
        <ValidationErrors errors={this.state.errors} />
        <button disabled={!this.state.isProductValid} onClick={this.createProduct}>Add Product</button>
      </div>
    )
  }
}

export default NewProductPage
