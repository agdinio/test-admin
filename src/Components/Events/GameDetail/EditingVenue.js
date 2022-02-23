import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { vhToPx, vwToPx } from '@/utils'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'
let h = 0

@inject('GameEventStore')
@observer
export default class EditingVenue extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      ddCityBlocker: null,
      _state: this.props.GameEventStore.values.venue.state,
      city: this.props.GameEventStore.values.venue.city,
      stadiumName: this.props.GameEventStore.values.venue.stadiumName,
    })
    h = this.props.GameEventStore.baseHeight
  }

  handleStateChange(e) {
    this.ddCityBlocker = (
      <DDCityBlocker>
        <ActivityIndicator height={h} />
      </DDCityBlocker>
    )
    this._state = JSON.parse(e.target.value)
    const stateCode = JSON.parse(e.target.value).code
    setTimeout(() => {
      this.props.GameEventStore.readCitiesByState(stateCode).then(response => {
        this.ddCityBlocker = null
      })
    }, 0)
  }

  handleCityChange(e) {
    this.city = JSON.parse(e.target.value)
  }

  handleStadiumNameChange(e) {
    this.stadiumName = e.target.value
  }

  handleContinue() {
    this.props.GameEventStore.values.venue.state = this._state
    this.props.GameEventStore.values.venue.city = this.city
    this.props.GameEventStore.values.venue.stadiumName = this.stadiumName
    this.props.close()
  }

  componentDidMount() {
    this.ddCityBlocker = (
      <DDCityBlocker>
        <ActivityIndicator height={h} />
      </DDCityBlocker>
    )
    const stateCode = this._state.code
    setTimeout(() => {
      this.props.GameEventStore.readCitiesByState(stateCode).then(response => {
        this.city = this.props.GameEventStore.cities.filter(
          o => o.name === this.props.GameEventStore.values.venue.city.name
        )[0]
        this.ddCityBlocker = null
      })
    }, 0)
  }

  render() {
    let { GameEventStore } = this.props

    return (
      <Container>
        <Section justifyContent="center" marginTop="20">
          <DDState
            value={JSON.stringify(this._state)}
            onChange={this.handleStateChange.bind(this)}
          >
            <option value={JSON.stringify({ code: '', name: '' })}>
              STATE
            </option>
            {GameEventStore.states.map(loc => (
              <option key={`state-${loc.code}`} value={JSON.stringify(loc)}>
                {loc.name}
              </option>
            ))}
          </DDState>
        </Section>
        <Section justifyContent="center" marginTop="1">
          <DDCityWrapper>
            <DDCity
              value={JSON.stringify(this.city)}
              onChange={this.handleCityChange.bind(this)}
            >
              <option value={JSON.stringify({ name: '', lat: '', long: '' })}>
                CITY
              </option>
              {GameEventStore.cities.map(loc => (
                <option key={`city-${loc.name}`} value={JSON.stringify(loc)}>
                  {loc.name}
                </option>
              ))}
            </DDCity>
            {this.ddCityBlocker}
          </DDCityWrapper>
        </Section>
        <Section justifyContent="center" marginTop="1">
          <TextBox
            type="text"
            widthInPct={90}
            placeholder="stadium name"
            value={this.stadiumName}
            onChange={this.handleStadiumNameChange.bind(this)}
          />
        </Section>
        <Section justifyContent="center" marginTop="2">
          <div
            style={{
              width: '90%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              text="cancel"
              color={'#ffffff'}
              hasBorder
              marginRight
              onClick={this.props.close}
            />
            <Button
              text="continue"
              color={'#ffffff'}
              backgroundColor={'#18c5ff'}
              onClick={this.handleContinue.bind(this)}
            />
          </div>
        </Section>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`

const Section = styled.div`
  width: ${props => props.widthInPct || 100}%;
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
  display: flex;
  ${props => (props.direction ? `flex-direction:${props.direction}` : ``)};
  ${props =>
    props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => (props.alignItems ? `align-items:${props.alignItems};` : ``)};
`

const DDState = styled.select`
  width: 90%;
  height: ${props => vhToPx(h + 2)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-1)} right;
  background-size: ${props => vhToPx(4)};
  text-indent: 5%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(3)};
  line-height: 1;
  text-transform: uppercase;
`

const DDCityWrapper = styled.div`
  position: relative;
  width: 90%;
  height: ${props => vhToPx(h + 2)};
`

const DDCityBlocker = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
`

const DDCity = styled.select`
  position: absolute;
  width: 100%;
  height: 100%;
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-1)} right;
  background-size: ${props => vhToPx(4)};
  text-indent: 5%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(3)};
  line-height: 1;
  text-transform: uppercase;
`

const TextBox = styled.input`
  font-family: ${props => props.font || 'pamainbold'};
  font-size: ${props => vhToPx(3)};
  width: ${props => props.widthInPct}%;
  height: ${props => vhToPx(h + 2)};
  border: none;
  outline: none;
  text-indent: 5%;
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(0.1)};
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

const Button = styled.div`
  width: 25%;
  height: ${props => vhToPx(5)};
  ${props =>
    props.backgroundColor ? `background-color:${props.backgroundColor}` : ``};
  ${props =>
    props.hasBorder ? `border:${vhToPx(0.4)} solid ${props.color}` : ``};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  ${props => (props.marginRight ? `margin-right:${vwToPx(0.5)}` : ``)};
  &:after {
    content: '${props => props.text}';
    font-family: pamainregular;
    font-size: ${props => vhToPx(2.5)};
    color: ${props => props.color};
    text-transform: uppercase;
    line-height: 1;
  }
`
