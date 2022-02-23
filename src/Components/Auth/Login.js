import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { vhToPx, vwToPx } from '@/utils'
import PlayAlongNowIcon from '@/assets/images/PlayAlongNow-Logo_Invert.svg'
import { TimelineMax } from 'gsap'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'

@inject('OperatorStore', 'NavigationStore', 'GameEventStore')
@observer
export default class Login extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      error: null,
      activityIndicator: null,
    })
  }

  handleLoginClick() {
    if (this.refLoginButton) {
      this.activityIndicator = (
        <ActivityIndicator height={5} color={'#ffffff'} />
      )
      this.refLoginButton.style.cursor = 'none'
    }

    this.props.OperatorStore.login().then(next => {
      if (next) {
        this.props.NavigationStore.setCurrentView('/portal')
      } else {
        if (this.refError) {
          new TimelineMax({ repeat: 0 })
            .set(this.refError, {
              innerHTML: 'invalid username and/or password',
              delay: 0.5,
              onComplete: () => {
                this.props.OperatorStore.auth.password = ''
              },
            })
            .to(this.refError, 0.3, { opacity: 1 })
            .set(this.refError, { opacity: 0, innerHTML: '', delay: 3 })
        }
      }
      if (this.refLoginButton) {
        this.activityIndicator = null
        this.refLoginButton.style.cursor = 'pointer'
      }
    })
  }

  handleInput(e) {
    this.props.OperatorStore.auth[e.target.name] = e.target.value

    if ('username' == e.target.name) {
      this.validateUsername()
    }
  }

  handleEnterKey(e) {
    if (e.which === 13 || e.keyCode === 13) {
      const valid =
        this.props.OperatorStore.auth.username &&
        this.props.OperatorStore.auth.username.length > 0
          ? true
          : false
      if (valid) {
        this.handleLoginClick()
      }
    }
  }

  validateUsername() {
    if (this.props.OperatorStore.auth.username.length > 0) {
      this.refLoginButton.style.pointerEvents = 'auto'
      this.refLoginButton.style.cursor = 'pointer'
    } else {
      this.refLoginButton.style.pointerEvents = 'none'
      this.refLoginButton.style.cursor = 'default'
    }
  }

  componentDidMount() {
    this.validateUsername()
  }

  render() {
    let { OperatorStore } = this.props

    return (
      <Container>
        <Section marginTop={25} marginBottom={5}>
          <Logo src={PlayAlongNowIcon} />
        </Section>
        <Section marginBottom={4}>
          <TextWrapper>
            <Text
              font={'pamainextrabold'}
              size={2.8}
              color={'#000000'}
              uppercase
            >
              administrative log-in
            </Text>
          </TextWrapper>
          <TextWrapper>
            <Text
              font={'pamainextrabold'}
              size={1.9}
              color={'rgba(0,0,0, 0.5)'}
              uppercase
            >
              manage events, campaigns, sponsors & prizes
            </Text>
          </TextWrapper>
        </Section>
        <Section marginBottom={3.5} center>
          <Error innerRef={ref => (this.refError = ref)} />
          <FormWrapper>
            <FormFieldSet marginBottom={2}>
              <FormInput
                id="username"
                name="username"
                type="text"
                placeholder="USERNAME"
                value={OperatorStore.auth.username}
                valid={undefined}
                onChange={this.handleInput.bind(this)}
                onKeyUp={this.handleEnterKey.bind(this)}
              />
            </FormFieldSet>
            <FormFieldSet>
              <FormInput
                id="password"
                name="password"
                type="password"
                placeholder="PASSWORD"
                value={OperatorStore.auth.password}
                onChange={this.handleInput.bind(this)}
                onKeyUp={this.handleEnterKey.bind(this)}
              />
            </FormFieldSet>
          </FormWrapper>
        </Section>
        <Section marginBottom={0.6} center>
          <LoginButton
            innerRef={ref => (this.refLoginButton = ref)}
            onClick={
              this.activityIndicator ? null : this.handleLoginClick.bind(this)
            }
            id="login-button"
          >
            {this.activityIndicator}
          </LoginButton>
        </Section>
        <Section>
          <TextWrapper>
            <Text
              font={'pamainextrabold'}
              size={1.4}
              color={'rgba(0,0,0, 0.4)'}
              letterSpacing={0}
              uppercase
            >
              can't login? ask your executive chief
            </Text>
          </TextWrapper>
        </Section>
      </Container>
    )
  }
}

const Container = styled.div`
  width: ${props => vwToPx(100)};
  height: ${props => vhToPx(100)};
  display: flex;
  flex-direction: column;
  background-color: #eaeaea;
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  ${props => (props.center ? 'align-items: center;' : '')};
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
`

const Logo = styled.img`
  height: ${props => vhToPx(8)};
`

const TextWrapper = styled.div`
  text-align: center;
`

const Text = styled.span`
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => vhToPx(props.size || 3)};
  color: ${props => props.color || '#000000'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  ${props =>
    props.letterSpacing ? `letter-spacing:${props.letterSpacing}` : ''};
`

const FormWrapper = styled.form`
  width: 15%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const FormFieldSet = styled.fieldset`
  width: 100%;
  border: none;
  position: relative;
  margin-top: ${props => vhToPx(props.marginTop) || 0};
  margin-bottom: ${props => vhToPx(props.marginBottom) || 0};
`

const FormInput = styled.input`
  ${props =>
    props.valid === undefined
      ? 'color: black'
      : `color: ${props.valid ? '#2fc12f' : '#ed1c24'}`};
  font-family: pamainbold;
  width: 100%;
  height: ${props => vhToPx(5)};
  border: none;
  outline: none;
  font-size: ${props => vhToPx(2)};
  letter-spacing: ${props => vhToPx(0.1)};
  line-height: 1;
  padding-left: 5%;

  &::placeholder {
    color: #cccccc;
  }
  &::-ms-input-placeholder {
    color: #cccccc;
  }
  &::-webkit-input-placeholder {
    color: #cccccc;
  }
`

const LoginButton = styled.div`
  width: ${props => vwToPx(9)};
  height: ${props => vhToPx(6)};
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  &:before {
    content: 'access';
    font-family: pamainbold;
    font-size: ${props => vhToPx(6 * 0.4)};
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
    line-height: 1;
    height: ${props => vhToPx(6 * 0.4 * 0.75)};
    color: #ffffff;
    margin-bottom: 1%;
  }
`

const Error = styled.span`
  font-family: pamainregular;
  font-size: ${props => vhToPx(2)};
  color: #ff0000;
  text-transform: uppercase;
  opacity: 0;
`
