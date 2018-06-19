'use strict'

const aws = require('aws-sdk') // eslint-disable-line import/no-unresolved, import/no-extraneous-dependencies
const KH = require('kinesis-handler')

const eventSchema = require('./retail-stream-schema-egress.json')
const productCartSchema = require('./product-cart-schema.json')

const constants = {
  // self
  MODULE: 'cart/builder/cart.js',
  // methods
  METHOD_PUT_PRODUCT: 'putProduct',
  // resources
  TABLE_CART_NAME: process.env.TABLE_CART_NAME,
}

const kh = new KH.KinesisHandler(eventSchema, constants.MODULE)

const dynamo = new aws.DynamoDB.DocumentClient()

const impl = {
  // TODO update the below comment to reflect cart schema
  /**
   * Put the carted product in to the dynamo cart catalog.  Example event:
   * {
   *   "schema": "com.nordstrom/retail-stream/1-0-0",
   *   "origin": "hello-retail/product-producer-automation",
   *   "timeOrigin": "2017-01-12T18:29:25.171Z",
   *   "data": {
   *     "schema": "com.nordstrom/product/cart/1-0-0",
   *     "id": "4579874"
   *   }
   * }
   * @param event The product to put in the catalog.
   * @param complete The callback to inform of completion, with optional error parameter.
   */
// TODO check this method
  putProduct: (event, complete) => {
    const updated = Date.now()
    let priorErr
    const updateCallback = (err) => {
      if (priorErr === undefined) { // first update result
        if (err) {
          priorErr = err
        } else {
          priorErr = false
        }
      } else if (priorErr && err) { // second update result, if an error was previously received and we have a new one
        complete(`${constants.METHOD_PUT_PRODUCT} - errors updating DynamoDb: ${[priorErr, err]}`)
      } else if (priorErr || err) {
        complete(`${constants.METHOD_PUT_PRODUCT} - error updating DynamoDb: ${priorErr || err}`)
      } else { // second update result if error was not previously seen
        complete()
      }
    }
    const dbParamsCart = {
      TableName: constants.TABLE_CART_NAME,
      Key: {
        id: event.data.id, // TODO change to match cart schema; primary key is customer id
      },
      UpdateExpression: [ // TODO change to match cart schema
        'set',
        '#c=if_not_exists(#c,:c),',
        '#cb=if_not_exists(#cb,:cb),',
        '#u=:u,',
        '#ub=:ub,',
        '#b=:b,',
        '#n=:n,',
        '#d=:d,',
      ].join(' '),
      ExpressionAttributeNames: {
        '#c': 'created',
        '#cb': 'createdBy',
        '#u': 'updated',
        '#ub': 'updatedBy',
        '#b': 'brand',
        '#n': 'name',
        '#d': 'description',
      },
      ExpressionAttributeValues: {
        ':c': updated,
        ':cb': event.origin,
        ':u': updated,
        ':ub': event.origin,
        ':b': event.data.brand,
        ':n': event.data.name,
        ':d': event.data.description,
      },
      ReturnValues: 'NONE',
      ReturnConsumedCapacity: 'NONE',
      ReturnItemCollectionMetrics: 'NONE',
    }
    dynamo.update(dbParamsCart, updateCallback)
  },
}

kh.registerSchemaMethodPair(productCartSchema, impl.putProduct)

module.exports = {
  processKinesisEvent: kh.processKinesisEvent.bind(kh),
}

console.log(`${constants.MODULE} - CONST: ${JSON.stringify(constants, null, 2)}`)
console.log(`${constants.MODULE} - ENV:   ${JSON.stringify(process.env, null, 2)}`)
