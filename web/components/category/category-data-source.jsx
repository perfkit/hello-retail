import AWS from 'aws-sdk'
import { Component, PropTypes } from 'react'
import config from '../../config'

class CategoryDataSource extends Component {
  static propTypes = {
    categoriesLoaded: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.getCategoriesAsync = this.getCategoriesAsync.bind(this)
    this.getCategoriesFromDynamoAsync = this.getCategoriesFromDynamoAsync.bind(this)
    this.componentDidMount = this.componentDidMount.bind(this)
  }

  componentDidMount() {
    this.dynamo = new AWS.DynamoDB()

    this.getCategoriesAsync()
      .then(this.props.categoriesLoaded)
  }

  getCategoriesFromDynamoAsync() {
    const params = {
      TableName: config.ProductCategoryTableName,
      AttributesToGet: ['category'],
    }
    return this.dynamo.scan(params).promise()
  }

  getCategoriesAsync() {
    return this.getCategoriesFromDynamoAsync()
      .then((data) => { // report successful results
        const categoriesList = []
        data.Items.forEach((item) => {
          categoriesList.push({
            name: item.category.S,
          })
        })
        return categoriesList
      })
  }

  render() {
    return null
  }
}

export default CategoryDataSource
