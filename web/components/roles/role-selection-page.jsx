import React, { Component } from 'react'
import { Link } from 'react-router'
import { Grid, Col, Row, Image } from 'react-bootstrap'


class RoleSelectionPage extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <div>
        <Grid>
          <Row className="show-grid" >
            <Col xs={12} md={8}>
              <Image src="https://i.imgur.com/1j4Vzfu.png" responsive />
            </Col>
            <Col xs={6} md={4}>
              <h3><em>Select Role</em></h3>
              <div><Link to={'/categories/'}> <Image src="https://i.imgur.com/KScnehK.png" responsive /> </Link> </div>
              <div><Link to={'/merchant/'}> <Image src="https://i.imgur.com/j7mgU2X.png" responsive /> </Link> </div>
              <div><Link to={'/photographer/'}> <Image src="https://i.imgur.com/NUuS64L.png" responsive /> </Link> </div>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

export default RoleSelectionPage
