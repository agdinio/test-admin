import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { vhToPx, vwToPx, dateTimeZone } from '@/utils'
import dateFormat from 'dateformat'
import moment from 'moment-timezone'

@observer
export default class DateAndTimeTick extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      currentDate: null,
      currentTime: null,
      currentMeridian: null,
    })

    this.timeTimeoutID = null
    this.timeIntervalID = null
    this.tz = 'America/Los_Angeles'
  }

  componentWillUnmount() {
    clearTimeout(this.timeTimeoutID)
    clearInterval(this.timeIntervalID)
  }

  componentDidMount() {
    // console.log('PST', moment(new Date()).tz('America/Los_Angeles').toString(), dateFormat(moment(new Date(result[0][0].gameTimeStart)).tz('America/Los_Angeles'), 'yyyy-mm-dd H:MM')      )
    // console.log('GMT', moment(new Date()).tz('Asia/Singapore').format('yyyy-M-D HH:mm').toString()      )//var aestTime = new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"});
    //console.log('AEST time: '+ (new Date(aestTime)).toISOString())
    //console.log('AEST TIME: ', dateTimeZone(new Date(), this.tz))

    let today = dateTimeZone(new Date(), this.tz)
    this.currentDate = dateFormat(today, 'mmmm dS, dddd').toUpperCase()
    this.currentTime = dateFormat(today, 'hh:MM')
    this.currentMeridian = dateFormat(today, 'TT')

    if (new Date().getSeconds() < 60) {

      this.timeTimeoutID = setTimeout(() => {
        today = dateTimeZone(new Date(), this.tz)
        this.currentDate = dateFormat(today, 'mmmm dS, dddd').toUpperCase()
        this.currentTime = dateFormat(today, 'hh:MM')
        this.currentMeridian = dateFormat(today, 'TT')

        this.timeIntervalID = setInterval(() => {
          today = dateTimeZone(new Date(), this.tz)
          this.currentDate = dateFormat(today, 'mmmm dS, dddd').toUpperCase()
          this.currentTime = dateFormat(today, 'hh:MM')
          this.currentMeridian = dateFormat(today, 'TT')
        }, 60000)
      }, (60 - new Date().getSeconds()) * 1000)

    } else {

      this.timeIntervalID = setInterval(() => {
        today = dateTimeZone(new Date(), this.tz)
        this.currentDate = dateFormat(today, 'mmmm dS, dddd').toUpperCase()
        this.currentTime = dateFormat(today, 'hh:MM')
        this.currentMeridian = dateFormat(today, 'TT')
      }, 60000)

    }
  }

  render() {
    const timeZone = moment.tz.guess() //singapore etc...
    const timeZoneAbbr = moment.tz(this.tz).zoneAbbr()
    //const timeZoneOffset = time.getTimezoneOffset()

    return (
      <Container>
        {
          this.currentDate && this.currentTime ? (
            <Wrapper>
              <Text font={'pamainlight'} size={4} color={'#000000'} uppercase nowrap>{this.currentDate}</Text>
              <Text font={'pamainextrabold'} size={4} color={'#000000'}>&nbsp;•&nbsp;</Text>
              <CurrentTime>
                {this.currentTime}<CurrentMeridian>{this.currentMeridian}</CurrentMeridian>
              </CurrentTime>
              <Text font={'pamainlight'} size={4} color={'#000000'} uppercase nowrap>&nbsp;{timeZoneAbbr}</Text>
            </Wrapper>
          ) : null
        }
      </Container>
    )
  }

}

const Container = styled.div`
  height: 100%;
`

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
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
  letter-spacing: ${props => vhToPx(props.nospacing ? 0 : 0.1)};
`

const CurrentTime = styled.div`
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(4)};
  color: #000000;
  text-transform: uppercase;
  line-height: 1;
  display: flex;
  flex-direction: row;
`

const CurrentMeridian = styled.div`
  height: 100%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(2)};
  line-height: 1.1;
  color: #000000;
  text-transform: uppercase;
`
