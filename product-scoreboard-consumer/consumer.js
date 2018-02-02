'use strict'

const aws = require('aws-sdk') // eslint-disable-line import/no-unresolved, import/no-extraneous-dependencies
const KH = require('kinesis-handler')

const eventSchema = require('./retail-stream-schema-ingress.json')
const productPurchaseSchema = require('./product-purchase-schema.json')

const constants = {
  // self
  MODULE: 'product-scoreboard-consumer/consumer.js',
  // methods
  METHOD_PUT_PRODUCT: 'processPurchase',
  // resources
}

const kh = new KH.KinesisHandler(eventSchema, constants.MODULE)


const impl = {
  processPurchase: (event, complete) => {
    // do the things
    console.log(event)
  }
}

kh.registerSchemaMethodPair(productPurchaseSchema, impl.processPurchase)

module.exports = {
  processKinesisEvent: kh.processKinesisEvent.bind(kh),
}

console.log(`${constants.MODULE} - CONST: ${JSON.stringify(constants, null, 2)}`)
console.log(`${constants.MODULE} - ENV:   ${JSON.stringify(process.env, null, 2)}`)
