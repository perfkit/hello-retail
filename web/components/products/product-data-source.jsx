import { Component, PropTypes } from 'react'
import config from '../../config'
import * as util from '../util'

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
        let pdata = JSON.parse(data)  //TODO maybe rework
        productList.push({
          brand: pdata.Item.brand.S,
          description: pdata.Item.description.S,
          name: pdata.Item.name.S,
          id: pdata.Item.id.S,
          image: pdata.Item.image ? pdata.Item.image.S : null,
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
        JSON.parse(data).Items.forEach((item) => {  //TODO maybe rework
          productList.push({
            brand: item.brand.S,
            description: item.description.S,
            name: item.name.S,
            id: item.id.S,
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
