import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import config from '../../config'

class CartItem extends Component {
  static propTypes = {
    awsLogin: PropTypes.shape({
      aws: PropTypes.shape({
        DynamoDB: PropTypes.shape({
          DocumentClient: PropTypes.func,
        }),
      }),
    }),
    productId: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
  };

  static defaultProps = {
    awsLogin: null,
  }

  constructor(props) {
    super(props)
    this.state = {}
    this.getProductsByIdAsync = this.getProductsByIdAsync.bind(this)
    this.getProductByIdFromDynamoAsync = this.getProductByIdFromDynamoAsync.bind(this)
    this.productsLoaded = this.productsLoaded.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount() {
    this.dynamo = new this.props.awsLogin.aws.DynamoDB()
    this.docClient = new this.props.awsLogin.aws.DynamoDB.DocumentClient()

    if (this.props.productId) {
      return (this.getProductsByIdAsync(this.props.productId)
        .then(this.productsLoaded))
    } else {
      return Promise.reject(new Error('productId required'))
    }
  }


  getProductByIdFromDynamoAsync(productId) {
    const params = {
      AttributesToGet: [
        'brand',
        'description',
        'name',
        'id',
        'image',
      ],
      TableName: config.ProductCatalogTableName,
      Key: {
        id: { S: productId.toString() },
      },
    }
    return this.dynamo.getItem(params).promise()
  }

  getProductsByIdAsync(productId) {
    return this.getProductByIdFromDynamoAsync(productId)
      .then((data) => {
        const productList = []
        productList.push({
          brand: data.Item.brand.S,
          description: data.Item.description.S,
          name: data.Item.name.S,
          id: data.Item.id.S,
          image: data.Item.image ? data.Item.image.S : null,
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

  // TODO: Return cart items by last updatedAt timeout
  // TODO: Add total quantity of cart items near icon or at the top
  render() {
    return (
      <div>
        <h4>
          <Link
            className="cartItemLink"
            to={`/product/${encodeURIComponent(this.props.productId)}`}
          >
            {this.state.name}
          </Link>
        </h4>
        <div><em>{this.state.brand}</em></div>
        <div><b>Quantity:</b> {this.props.quantity}</div>
        <div>{this.state.description}</div>
        <div>
          { this.state.image ? (<img className="productImage" src={this.state.image} alt={this.state.name} />) : null }
        </div>
        <br />
      </div>
    )
  }
}

export default CartItem
