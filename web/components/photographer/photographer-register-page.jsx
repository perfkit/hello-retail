import AWS from 'aws-sdk'
import https from 'https'
import React, { Component} from 'react'
import ValidationErrors from '../validation-errors'
import config from '../../config'

class PhotographerRegisterPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      registered: false,
      phoneNumber: '',
      validPhoneNumber: false,
      errors: [],
      id: '',
      validID: false,
    }
    this.registerPhotographer = this.registerPhotographer.bind(this)
    this.phoneNumberChange = this.phoneNumberChange.bind(this)
    this.idChange = this.idChange.bind(this)
    this.render = this.render.bind(this)
  }

  makeApiRequest(api, verb, path, data) {
    return new Promise((resolve, reject) => {
      // https://{restapi_id}.execute-api.{region}.amazonaws.com/{stage_name}/
      const apiPath = `/${config.Stage}${path}`
      const body = JSON.stringify(data)
      const hostname = `${api}.execute-api.${config.AWSRegion}.amazonaws.com`
      const endpoint = new AWS.Endpoint(hostname)
      const request = new AWS.HttpRequest(endpoint)

      request.method = verb
      request.path = apiPath
      request.region = config.AWSRegion
      request.host = endpoint.host
      request.body = body
      request.headers.Host = endpoint.host

      const postRequest = https.request(request, (response) => {
        let result = ''
        response.on('data', (d) => {
          result += d
        })
        response.on('end', () => resolve(result))
        response.on('error', error => reject(error))
      })

      postRequest.write(body)
      postRequest.end()
    })
  }

  registerPhotographer() {
    const phoneNumber = this.state.phoneNumber
    const id = this.state.id

    // Disable the submit button while request is in flight
    this.setState({
      validPhoneNumber: false,
      validID: false,
    })

    // Call user-info api with update-phone event
    this.makeApiRequest(config.EventWriterApi, 'POST', '/event-writer/', {
      schema: 'com.nordstrom/user-info/update-phone/1-0-0',
      id: id,
      phone: phoneNumber,
      origin: `hello-retail/web-client-create-product/dummy_id/dummy_name`,
    })
    .then(() => {
      this.setState({
        registered: true,
      })
    })
    .catch((error) => {
      // Show error message and re-enable submit button so user can try again.
      this.setState({
        validPhoneNumber: true,
        validID: true,
        errors: [error],
      })
    })
  }

  phoneNumberChange(event) {
    // Regardless of formatting valid numbers are 10 digits
    const phoneNumber = event.target.value.replace(/\D/g, '').substr(0, 10)
    const isPhoneNumberValid = (phoneNumber.match(/^\d{10}$/) !== null)

    this.setState({
      phoneNumber: phoneNumber,
      validPhoneNumber: isPhoneNumberValid,
    })
  }

  idChange(event) {
    // Regardless of formatting valid numbers are 10 digits
    const id = event.target.value
    const isIDValid = id.length > 0

    this.setState({
      id: id,
      validID: isIDValid,
    })
  }

  render() {
    if (this.state.registered) {
      return (
        <div>
          <h4>Thanks for registering!</h4>
          <p>You will get text messages to inform you of products that need their pictures taken.</p>
        </div>
      )
    }

    return (
      <div>
        <h3><em>Photographer Registration</em></h3>
        <div>
          <label>
            ID:
            <br />
            <input value={this.state.id} onChange={this.idChange} />
          </label>
          <label>
            Phone Number:
            <br />
            <input value={this.state.phoneNumber} onChange={this.phoneNumberChange} />
            <br />
            <h5>(Additional charges may apply.)</h5>
          </label>
          <br />
          <ValidationErrors errors={this.state.errors} />
          <button disabled={!(this.state.validPhoneNumber || this.state.validID)} onClick={this.registerPhotographer}>Register</button>
        </div>
      </div>
    )
  }
}

export default PhotographerRegisterPage
