import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import dateFormat from 'dateformat'
import { vhToPx, diffHours } from '@/utils'

@observer
export default class CountdownClock extends Component {
  constructor(props) {
    super(props)

    h = this.props.height

    extendObservable(this, {
      currentDate: this.getFormattedDate(),
      kickoffDate: diffHours(this.props.timeStart, new Date()),
      check: null,
    })
  }

  getFormattedDate() {
    return dateFormat(new Date(), 'dddd, mmmm dS yyyy').toUpperCase()
  }

  componentWillUnmount() {
    clearInterval(this.check)
  }

  componentDidMount() {
    this.check = setInterval(() => {
      this.currentDate = this.getFormattedDate()
      this.kickoffDate = diffHours(this.props.timeStart, new Date())

    }, 1000)
  }

  render() {
    return (
      <Container>
        <ActiveDate>{this.currentDate}</ActiveDate>
        <ActiveCountdown>
          <Kickoff>KICK-OFF IN</Kickoff> <span>{this.kickoffDate}</span>
        </ActiveCountdown>
      </Container>
    )
  }
}

let h = 0

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const ActiveDate = styled.div`
  font-family: pamainlight;
  font-size: ${props => vhToPx(h * 0.03)};
  color: #ffffff;
  line-height: 1;
`
const ActiveCountdown = styled.div`
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.038)};
  color: #ffffff;
  line-height: 1;
`
const Kickoff = styled.span`
  color: #c61818;
`
