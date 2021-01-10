'use strict'

const aws = require('aws-sdk') // eslint-disable-line import/no-unresolved, import/no-extraneous-dependencies
const BbPromise = require('bluebird')

/**
 * AWS
 */
aws.config.setPromisesDependency(BbPromise)
const dynamo = new aws.DynamoDB.DocumentClient()
const kms = new aws.KMS()

/**
 * Constants
 */
const constants = {
  // internal
  ERROR_SERVER: 'Server Error',
  // module and method names
  MODULE: 'unmessage.js',
  METHOD_HANDLER: 'handler',
  METHOD_SEND_MESSAGE: 'sendMessage',
  // external
  TABLE_PHOTO_REGISTRATIONS_NAME: process.env.TABLE_PHOTO_REGISTRATIONS_NAME,
}

/**
 * Errors
 */
class ServerError extends Error {
  constructor(message) {
    super(message)
    this.name = constants.ERROR_SERVER
  }
}

/**
 * Utility Methods (Internal)
 */
const util = {
  decrypt: (field, value) => kms.decrypt({ CiphertextBlob: new Buffer(value, 'base64') }).promise().then(
    data => BbPromise.resolve(data.Plaintext.toString('ascii')),
    error => BbPromise.reject({ field, error }) // eslint-disable-line comma-dangle
  ),
}

/**
 * Implementation (Internal)
 */
const impl = {
  failAssignment: (event) => {
    const updated = Date.now()
    const params = {
      TableName: constants.TABLE_PHOTO_REGISTRATIONS_NAME,
      Key: {
        id: event.photographer.id,
      },
      ConditionExpression: '#aa=:aa',
      UpdateExpression: [
        'set',
        '#u=:u,',
        '#ub=:ub',
        'remove',
        '#aa',
      ].join(' '),
      ExpressionAttributeNames: {
        '#u': 'updated',
        '#ub': 'updatedBy',
        '#aa': 'assignment',
      },
      ExpressionAttributeValues: {
        ':u': updated,
        ':ub': event.origin,
        ':aa': event.data.id.toString(),
      },
      ReturnValues: 'NONE',
      ReturnConsumedCapacity: 'NONE',
      ReturnItemCollectionMetrics: 'NONE',
    }
    return dynamo.update(params).promise().then(
      () => BbPromise.resolve(event),
      err => BbPromise.reject(new ServerError(`error removing assignment from registration: ${err}`)) // eslint-disable-line comma-dangle
    )
  },
  /**
   * Send a message, generated by the given event, to the assigned photographer
   * @param event The event containing the photographer assignment
   */
  sendMessage: event => {
    to: event.photographer.phone,
    from: 'Mock Phone Number or ID',
    body: [
      `Hello ${event.photographer.name}.`,
      'You are unassigned.',
      'We will send an assignment soon!',
    ].join('\n'),
  },
}

module.exports = {
  handler: (event, context, callback) => {
    console.log(JSON.stringify(event, null, 2))
    impl.failAssignment(event)
      .then(impl.sendMessage)
      .then((message) => {
        console.log(`Success: ${JSON.stringify(message, null, 2)}`)
        const result = event
        delete result.photographer
        if (!result.unassignments) { // keep track of how many times we've unassigned this product photo
          result.unassignments = 1
        } else {
          result.unassignments += 1
        } // TODO something interesting with unassignments?  Perhaps in StepFunction, exiting after N failures?
        callback(null, result)
      })
      .catch((ex) => {
        const err = `${constants.MODULE} ${ex.message}:\n${ex.stack}`
        console.log(err)
        callback(err)
      })
  },
}
