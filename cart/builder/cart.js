'use strict'

const aws = require('aws-sdk') // eslint-disable-line import/no-unresolved, import/no-extraneous-dependencies
const KH = require('kinesis-handler')

const eventSchema = require('./retail-stream-schema-ingress.json')
const addCartSchema = require('./cart-add-schema.json')
const removeCartSchema = require('./cart-remove-schema.json')

const constants = {
  // self
  MODULE: 'cart/builder/cart.js',
  // methods
  METHOD_PUT_CART: 'putCart',
  METHOD_REMOVE_CART: 'removeCart',
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
   *     "schema": "com.nordstrom/product/add-cart/1-0-0",
   *     "id": "4579874"
   *   }
   *   "origin": "hello-retail/web-client-cart-add/amzn1.account.FFB43IREIOXFBHWJERAQCI9M5JCJ/Jane Smith",
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
          userId: event.origin.slice(event.origin.lastIndexOf(".")+1, event.origin.lastIndexOf("/")), // example userId: FFB43IREIOXFBHWJERAQCI9M5JCJ
          productId: event.data.id,
      },
      UpdateExpression: [
        'SET',
        '#c=if_not_exists(#c,:c),',
        '#u=:u,',
        '#fn=:fn',
        'ADD',
        '#q :q',
      ].join(' '),
      ExpressionAttributeNames: {
        '#c': 'createdAt',
        '#u': 'updatedAt',
        '#fn': 'friendlyName',
        '#q': 'quantity',
      },
      ExpressionAttributeValues: {
        ':c': Date.now(),
        ':u': Date.now().toString(),
        ':fn': event.origin.slice(event.origin.lastIndexOf("/")+1), // example friendlyName: Jane Smith
        ':q': 1,
      },
      ReturnValues: 'NONE',
      ReturnConsumedCapacity: 'NONE',
      ReturnItemCollectionMetrics: 'NONE',
    }
    console.log(dbParamsCart)
    dynamo.update(dbParamsCart, updateCallback)
  },

  /**
   * Remove the product from the dynamo cart database.  Example event:
   * {
   *   "schema": "com.nordstrom/retail-stream/1-0-0",
   *   "data": {
   *     "schema": "com.nordstrom/product/remove-cart/1-0-0",
   *     "id": "4579874"
   *   }
   *   "origin": "hello-retail/web-client-cart-remove/amzn1.account.FFB43IREIOXFBHWJERAQCI9M5JCJ/Jane Smith",
   * }
   * @param event The product to remove from the cart.
   * @param complete The callback to inform of completion, with optional error parameter.
   */
  removeCart: (event, complete) => {
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
        complete(`${constants.METHOD_REMOVE_CART} - errors updating DynamoDb: ${[priorErr, err]}`)
      } else if (priorErr || err) {
        complete(`${constants.METHOD_REMOVE_CART} - error updating DynamoDb: ${priorErr || err}`)
      } else { // second update result if error was not previously seen
        complete()
      }
    }
    const dbParamsCart = {
      TableName: constants.TABLE_CART_NAME,
      Key: {
          userId: event.origin.slice(event.origin.lastIndexOf(".")+1, event.origin.lastIndexOf("/")),
          productId: event.data.id,
      },
    }
    console.log(dbParamsCart)
    dynamo.delete(dbParamsCart, updateCallback)
  },
}

kh.registerSchemaMethodPair(addCartSchema, impl.putCart)
kh.registerSchemaMethodPair(removeCartSchema, impl.removeCart)

module.exports = {
  processKinesisEvent: kh.processKinesisEvent.bind(kh),
}

console.log(`${constants.MODULE} - CONST: ${JSON.stringify(constants, null, 2)}`)
console.log(`${constants.MODULE} - ENV:   ${JSON.stringify(process.env, null, 2)}`)
