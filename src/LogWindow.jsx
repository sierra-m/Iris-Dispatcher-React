import React, { Component } from 'react'
import Card from 'react-bootstrap/Card'
import './style/logwindow.css'
import Container from 'react-bootstrap/Container'
import Badge from 'react-bootstrap/Badge'


class LogItem {
  constructor (time, status, imei, snippet) {
    this.time = time;
    this.status = status;
    this.imei = imei;
    this.snippet = snippet;
  }

  toComponent () {
    // Determine Bootstrap Badge color from status
    let statusVariant = 'primary';
    if (this.status === 'accept') statusVariant = 'success';
    else if (this.status === 'reject') statusVariant = 'warning';
    else if (this.status === 'error') statusVariant = 'danger';

    return (
      <div>
        <ColorSamp color={'#237eff'}>[{this.time}] </ColorSamp>
        {/* First letter caps */}
        <Badge variant={statusVariant}>{this.status.charAt(0).toUpperCase() + this.status.slice(1)}</Badge>
        <ColorSamp color={'#ff4b21'}> IMEI: {this.imei}</ColorSamp>
        <samp> | {this.snippet}</samp>
        {'\n'}
      </div>
    )
  }
}

export default class LogWindow extends Component {
  state = {
    items: []
  };

  defaultProps = {
    autoscroll: true
  };

  scrollToBottom () {
    this.el.scrollIntoView({behavior: 'smooth'});
  }

  print = (thing) => {
    this.state.items.push(thing);
    if (this.state.items.length > 20) {
      this.state.items.shift();
    }
    this.setState({items: this.state.items})
  };

  componentDidMount () {
    if (this.props.registerPrint !== null) {
      this.props.registerPrint(this.print);
    }
    if (this.props.autoscroll) this.scrollToBottom();
  }

  componentDidUpdate () {
    if (this.props.autoscroll) this.scrollToBottom();
  }

  render () {
    return (
      <Card className={'bg-light'}>
        <Card.Header>{this.props.title}</Card.Header>
        <Card.Text>
          <Container className={'log-container'}>
            <Card className={'log-card'}>
              <Card.Text>
                <Container className={'log-container'}>
                  {this.state.items.map(item => {
                    if (typeof item === 'string') return (
                      <div>
                        <samp>
                          {item}
                        </samp>
                        {'\n'}
                      </div>
                    );
                    else return item.toComponent();
                  })}
                  <div ref={el => {
                    this.el = el;
                  }}/>
                </Container>
              </Card.Text>
            </Card>
          </Container>
        </Card.Text>
      </Card>
    )
  }
}

const ColorSamp = (props) => (
  <samp style={{color: props.color}}>{props.children}</samp>
);

export {LogItem}