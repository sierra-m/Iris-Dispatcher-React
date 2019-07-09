import React, {Component} from 'react'
import Navbar from 'react-bootstrap/Navbar'
import irisIcon from './images/IrisBalloon.png'


export default class TitleBar extends Component {
  render() {
    return (
      <Navbar bg={'light'} expand={'large'}>
        <Navbar.Brand href="#home">
          <img
            alt=""
            src={irisIcon}
            width="40"
            height="40"
            className="d-inline-block align-top"
          />
          {' Iris Dispatcher'}
        </Navbar.Brand>
      </Navbar>
    )
  }
}