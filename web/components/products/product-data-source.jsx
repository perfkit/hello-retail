import { Component, PropTypes } from 'react'
import config from '../../config'
import * as util from '../util'

const AWS = require('aws-sdk');

const constants = {
  IMAGE_BUCKET: process.env.IMAGE_BUCKET,
}

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
    return this.getProductByIdFromApiAsync(id)
      .then((data) => {
        const productList = []
        const pdata = JSON.parse(data)
        const params = {
          Bucket: constants.IMAGE_BUCKET,
          Key: `i/p/${id}`
        };
        let img = null
        s3.getObject(params, function(err, data) {
          if(!err)
            img = data.Body.toString('utf-8')  // maybe .toString('utf-8') or .toString('binary')
        })
        productList.push({
          brand: pdata[0].brand,
          description: pdata[0].description,
          name: pdata[0].name,
          id: pdata[0].id,
          image: img ? `data:image/jpeg;base64,${img}` : null,
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
