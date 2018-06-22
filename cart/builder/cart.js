'use strict'

const aws = require('aws-sdk') // eslint-disable-line import/no-unresolved, import/no-extraneous-dependencies
const KH = require('kinesis-handler')

const eventSchema = require('./retail-stream-schema-ingress.json')
const productCartSchema = require('./product-cart-schema.json')

const constants = {
  // self
  MODULE: 'cart/builder/cart.js',
  // methods
  METHOD_PUT_CART: 'putCart',
  // resources
  TABLE_CART_NAME: process.env.TABLE_CART_NAME,
}

const kh = new KH.KinesisHandler(eventSchema, constants.MODULE)

const dynamo = new aws.DynamoDB.DocumentClient()

const impl = {
  /**
   * Put the carted product in to the dynamo cart database.  Example event:
   * {
   *   "schema": "com.nordstrom/retail-stream/1-0-0",
   *   "data": {
   *     "schema": "com.nordstrom/product/cart/1-0-0",
   *     "id": "4579874"
   *   }
   *   "origin": "hello-retail/product-producer-automation",
   * }
   * @param event The product to put in the cart.
   * @param complete The callback to inform of completion, with optional error parameter.
   */
  putCart: (event, complete) => {
    let priorErr
    const updateCallback = (err) => {
      if (priorErr === undefined) { // first update result
        if (err) {
          console.log("err = ", err)
          priorErr = err
        } else {
          priorErr = false
        }
      } else if (priorErr && err) { // second update result, if an error was previously received and we have a new one
        complete(`${constants.METHOD_PUT_CART} - errors updating DynamoDb: ${[priorErr, err]}`)
      } else if (priorErr || err) {
        complete(`${constants.METHOD_PUT_CART} - error updating DynamoDb: ${priorErr || err}`)
      } else { // second update result if error was not previously seen
        complete()
      }
    }
    const dbParamsCart = {
      TableName: constants.TABLE_CART_NAME,
      Key: {
          userId: event.origin,
          productId: event.data.id,
      },
      UpdateExpression: [
        'set',
        '#c=if_not_exists(#c,:c),',
        '#cb=if_not_exists(#cb,:cb)',
      ].join(' '),
      ExpressionAttributeNames: {
        '#c': 'created',
        '#cb': 'createdBy',
      },
      ExpressionAttributeValues: {
        ':c': Date.now(),
        ':cb': event.origin,
      },
      ReturnValues: 'NONE',
      ReturnConsumedCapacity: 'NONE',
      ReturnItemCollectionMetrics: 'NONE',
    }
    console.log(dbParamsCart)
    dynamo.update(dbParamsCart, updateCallback)
  },
}

kh.registerSchemaMethodPair(productCartSchema, impl.putCart)

module.exports = {
  processKinesisEvent: kh.processKinesisEvent.bind(kh),
}

console.log(`${constants.MODULE} - CONST: ${JSON.stringify(constants, null, 2)}`)
console.log(`${constants.MODULE} - ENV:   ${JSON.stringify(process.env, null, 2)}`)
