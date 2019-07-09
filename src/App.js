import React, { Component } from 'react'
import Container from 'react-bootstrap/Container'
import TitleBar from './TitleBar'
import LogWindow, { LogItem } from './LogWindow'
import './custom.scss';
import Row from 'react-bootstrap/Row'
import Column from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import moment from 'moment'
//import moment from 'moment'
//import express from 'express'
//import BodyParser from 'body-parser-xml'
import Card from "react-bootstrap/Card"
import Form from 'react-bootstrap/Form'

const logTime = () => new moment().format('HH:mm:ss');

const LOG_LENGTH = 20;
const UPDATE_DELAY = 2500;

const makeSnippet = (data) => (
  `Location:[${data.latitude}, ${data.longitude}] Time:'${data.datetime}' Vertical:${data.vertical_velocity}, ` +
  `Ground:${data.ground_speed}, Sats:${data.satellites}`
);

class App extends Component {
  state = {
    connected: false,
    autoscroll: true
  };

  updateInterval = 0;
  packetIDs = [];

  logID (id) {
    this.packetIDs.push(id);
    if (this.packetIDs.length > LOG_LENGTH) {
      this.packetIDs.shift();
    }
  }

  toggleConnected = async () => {
    if (!this.state.connected) {
      this.updateInterval = setInterval(this.getUpdates, UPDATE_DELAY);
    } else {
      clearInterval(this.updateInterval)
    }
    const result = await fetch('/connected', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({state: !this.state.connected})
    });
    const data = await result.json();
    this.print(`Dispatcher ${data.state ? 'connected' : 'disconnected'}`);
    this.setState({connected: !this.state.connected});
  };

  // Define print method for console log
  print = () => null;

  registerPrint = (func) => {
    this.print = func;
  };

  /**
   * Logs a list of packets
   * @param packets
   * @returns {Promise<void>}
   */
  async logData (packets) {
    if (packets && packets.length > 0) {
      for await (let packet of packets) {
        this.logID(packet.id);
        await this.print(new LogItem(logTime(), packet.status, packet.data.imei, makeSnippet(packet.data)));
      }
    }
  }

  getPacketLog = async () => {
    let res = await fetch('/packets');
    let data = await res.json();
    let repr = await JSON.stringify(data);
    this.print("New: " + repr)
  };

  getUpdates = async () => {
    const res = await fetch('/update', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({last_ids: this.packetIDs})
    });
    const data = await res.json();
    if (data.status === 'available') {
      await this.logData(data.update);
      console.log('Log updated.');
    }
  };

  async serverConnected () {
    const result = await fetch('/connected');
    const data = await result.json();
    if (data.state) {
      this.updateInterval = setInterval(this.getUpdates, UPDATE_DELAY);
    } else {
      clearInterval(this.updateInterval)
    }
    return data.state
  }

  refresh = async () => {
    clearInterval(this.updateInterval);
    const result = await fetch('/packets');
    const packets = await result.json();

    await this.logData(packets);
    const isConnected = await this.serverConnected();
    await this.setState({connected: isConnected});
  };

  changeAutoscroll = (evt) => {
    this.setState({autoscroll: evt.target.checked})
  };

  async componentDidMount () {
    const result = await fetch('/packets');
    const packets = await result.json();

    await this.logData(packets);
    const isConnected = await this.serverConnected();
    await this.setState({connected: isConnected});
  }

  render () {
    return (
      <div id={'dispatcher'}>
        <TitleBar/>
        <Container className={'mt-3'}>
          <Row>
            <Column lg={4} xl={4}>
              <Card>
                <Card.Body>
                  <Card.Title>Iris SBD Packet Dispatcher</Card.Title>
                  <Card.Text>
                    Status: {(this.state.connected) ? 'Connected' : 'Disconnected'}
                  </Card.Text>
                  {!this.state.connected && <Button variant={'success'} onClick={this.toggleConnected}>Connect</Button>}
                  {this.state.connected &&
                  <Button variant={'danger'} onClick={this.toggleConnected}>Disconnect</Button>}
                  <hr/>
                  <Button variant={'outline-primary'} onClick={this.refresh}>Refresh</Button>
                  <Form>
                    <Form.Group>
                      <Form.Check type="checkbox" label="Autoscroll" checked={this.state.autoscroll} onChange={this.changeAutoscroll}/>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            </Column>
            <Column>
              <LogWindow title={'Dispatcher Log'} registerPrint={this.registerPrint} autoscroll={this.state.autoscroll}/>
            </Column>
          </Row>
        </Container>
      </div>
    );
  }
}


export default App;
