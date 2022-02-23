import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'

@inject('NavigationStore', 'PlayStore')
export default class ErrorComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      lockedButton: false,
    }
  }

  handleRelogin() {
    this.props.NavigationStore.setCurrentView('/login')
    window.location.reload()
  }

  handleConnect() {
    this.setState({ lockedButton: true })
    this.props.PlayStore.reloadPage(res => {
      if (res.success) {
        this.props.reconnect()
      }
    })
  }

  render() {
    return (
      <Container>
        <Spacer style={{ marginBottom: '2vh' }}>
          <Text>{this.props.msg}</Text>
        </Spacer>
        <Spacer>
          {this.props.status === 'unauthorized' ? (
            <ReloadButton
              text="re-login"
              onClick={this.handleRelogin.bind(this)}
            />
          ) : (
            <ConnectButton
              locked={this.state.lockedButton}
              onClick={
                this.state.lockedButton ? null : this.handleConnect.bind(this)
              }
            />
          )}
        </Spacer>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  z-index: 300;
`

const Spacer = styled.div`
  width: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Text = styled.span`
  font-family: pamainbold;
  font-size: 4vh;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.2vh;
`

const ConnectButton = styled.div`
  width: 20vh;
  height: 7vh;
  border-radius: 0.2vh;
  background-color: #18c5ff;
  color: #ffffff;
  font-family: pamainlight;
  font-size: 3vh;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  &:after {
    content: '${props => (props.locked ? `CONNECTING...` : `CONNECT`)}';
  }
`

const ReloadButton = styled.div`
  width: 20vh;
  height: 7vh;
  border-radius: 0.2vh;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: '${props => props.text || `RELOAD`}';
    font-family: pamainlight;
    font-size: 3vh;
    color: #ffffff;
    line-height: 1;
    text-transform: uppercase;
  }
`
