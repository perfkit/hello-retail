import AWS from 'aws-sdk'
import https from 'https'
import loadjs from 'loadjs'
import React, { Component, PropTypes } from 'react'
import config from '../../config'

class AmazonLogin extends Component {
  static propTypes = {
    awsLoginComplete: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.loginConfig = {
      clientId: config.AuthClientId,
      awsRegion: config.AWSRegion,
      sessionName: config.SessionName,
      webAppRole: config.WebAppRole,
    }

    this.loginClicked = this.loginClicked.bind(this)
	this.handleIDInput = this.handleIDInput.bind(this)
	this.handleProfileInput = this.handleProfileInput.bind(this)
    this.sendUserLogin = this.sendUserLogin.bind(this)
    this.performLoginAndAssumeIdentity = this.performLoginAndAssumeIdentity.bind(this)

    this.state = {
	  profile_name_input: "",
	  id_input: "",
    }
  }

  performLoginAndAssumeIdentity(interactive) {
    const that = this
	that.setState({
	  profile: {
		id: this.state.id_input,
		name: this.state.profile_name_input,
	  },
	})
    that.sendUserLogin().then(() => {that.props.awsLoginComplete(that)})
  }

  loginClicked() {
    this.performLoginAndAssumeIdentity('auto')
  }
  
  handleProfileInput = event => {
    this.setState({ profile_name_input: event.target.value });  
  }
  
  handleIDInput = event => {
    this.setState({ id_input: event.target.value });  
  }

  sendUserLogin() {
    this.makeApiRequest(config.EventWriterAPI, 'POST', '/event-writer/', {
      schema: 'com.nordstrom/user-info/login/1-0-0',
      id: this.state.profile.id,
      name: this.state.profile.name,
      origin: `hello-retail/web-client-login-user/${this.state.profile.id}/${this.state.profile.name}`,
    })
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

      const signer = new AWS.Signers.V4(request, 'execute-api')
      signer.addAuthorization(this.webApplicationIdentityCredentials, new Date())

      const postRequest = https.request(request, (response) => {
        let result = ''
        response.on('data', (d) => { result += d })
        response.on('end', () => resolve(result))
        response.on('error', error => reject(error))
      })

      postRequest.write(body)
      postRequest.end()
    })
  }

  render() {
    return (
      <div id="login-root">
		<label for="input_id">ID:</label>
		<input type="text" id="input_id" name="input_id" onChange={this.handleIDInput}/>
		<label for="input_profile_name">Profile Name:</label>
		<input type="text" id="input_profile_name" name="input_profile_name" onChange={this.handleProfileInput}/>
        <button onClick={this.loginClicked}>Login</button>
      </div>
    );
  }
}

export default AmazonLogin
