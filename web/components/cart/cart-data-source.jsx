import { Component, PropTypes } from 'react'
import config from '../../config'

class CartDataSource extends Component {
  static propTypes = {
    awsLogin: PropTypes.shape({
      aws: PropTypes.shape({
        DynamoDB: PropTypes.func,
      }),
    }),
    cartItemsLoaded: PropTypes.func.isRequired,
  }

  static defaultProps = {
    awsLogin: null,
  }

  constructor(props) {
    super(props)
    this.getCartItemsAsync = this.getCartItemsAsync.bind(this)
    this.getCartItemsFromDynamoAsync = this.getCartItemsFromDynamoAsync.bind(this)
    this.productsLoaded = this.productsLoaded.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount() {
    this.dynamo = new this.props.awsLogin.aws.DynamoDB()

    this.getCartItemsAsync()
      .then(this.props.cartItemsLoaded)
  }

  getCartItemsFromDynamoAsync() {
    const params = {
      TableName: config.ProductCatalogTableName,
      AttributesToGet: ['name'],
    }
    return this.dynamo.scan(params).promise()
  }

  getCartItemsAsync() {
    return this.getCartItemsFromDynamoAsync()
      .then((data) => { // report successful results
        const cartItemsList = []
        data.Items.forEach((item) => {
          cartItemsList.push({
            name: item.name.S,
          })
        })
        return cartItemsList
      })
  }

  getProductsByCategoryFromDynamoAsync(category) {
    const params = {
      ProjectionExpression: '#br, #de, #na, id',
      TableName: config.ProductCatalogTableName,
      IndexName: 'Category',
      KeyConditionExpression: '#ct = :ct',
      ExpressionAttributeNames: {
        '#br': 'brand',
        '#de': 'description',
        '#na': 'name',
        '#ct': 'category',
      },
      ExpressionAttributeValues: {
        ':ct': { S: category },
      },
    }
    return this.dynamo.query(params).promise()
  }

  getProductsByCategoryAsync(category) {
    return this.getProductsByCategoryFromDynamoAsync(category)
      .then((data) => {
        const productList = []
        data.Items.forEach((item) => {
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
    return null
  }
}

export default CartDataSource
