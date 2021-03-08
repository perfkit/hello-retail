import { Component, PropTypes } from 'react'
import config from '../../config'
import * as util from '../util'

const AWS = require('aws-sdk');

let s3 = new AWS.S3();

class ProductDataSource extends Component {
  static propTypes = {
    category: PropTypes.string,
    productId: PropTypes.string,
    productsLoaded: PropTypes.func.isRequired,
  }

  static defaultProps = {
    category: null,
    productId: null,
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.getProductsByCategoryAsync.bind(this)
    this.getProductsByCategoryFromApiAsync.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount() {
    if (this.props.category) {
      return this.getProductsByCategoryAsync(this.props.category)
        .then(this.props.productsLoaded)
    } else if (this.props.productId) {
      return this.getProductsByIdAsync(this.props.productId)
        .then(this.props.productsLoaded)
    } else {
      return Promise.reject(new Error('either category or productId required'))
    }
  }

  getProductByIdFromApiAsync(id) {
    return util.makeApiRequest(config.ProductCatalogApi, 'GET', `/products?id=${encodeURIComponent(id)}`, {})
  }

  getProductsByIdAsync(id) {
    const params = {
      Bucket: config.ImageBucket,
      Key: `i/p/${id}`
    };
    return Promise.all([this.getProductByIdFromApiAsync(id), s3.getObject(params).promise().then(value => {return value}, () => {return null})])
      .then((results) => {
        const image = results[1]
        const data = results[0]
        const productList = []
        const pdata = JSON.parse(data)
        productList.push({
          brand: pdata[0].brand,
          description: pdata[0].description,
          name: pdata[0].name,
          id: pdata[0].id,
          image: image ? `data:image/jpeg;base64,${image.Body.toString('utf-8')}` : null,
        })
        return productList
      })
  }

  getProductsByCategoryFromApiAsync(category) {
    return util.makeApiRequest(config.ProductCatalogApi, 'GET', `/products?category=${encodeURIComponent(category)}`, {})
  }

  getProductsByCategoryAsync(category) {
    return this.getProductsByCategoryFromApiAsync(category)
      .then((data) => {
        const productList = []
        JSON.parse(data).forEach((item) => {
          productList.push({
            brand: item.brand,
            description: item.description,
            name: item.name,
            id: item.id,
          })
        })
        return productList
      })
  }

  render() {
    return null
  }
}

export default ProductDataSource
