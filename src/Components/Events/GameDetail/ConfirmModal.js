import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx, vwToPx, evalImage } from '@/utils'
import TeamIcon from '@/Components/Common/TeamIcon'
import dateFormat from 'dateformat'
import OperatorsIcon from '@/assets/images/icon-list-black.svg'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'

export default class ConfirmModal extends Component {
  constructor(props) {
    super(props)
    this.activityIndicator = null
  }

  handleCreateClick() {
    this.props.create()

    if (this.refCreateEventButton) {
      this.refCreateEventButton.style.pointerEvents = 'none'
    }
    if (this.refCancelButton) {
      this.refCancelButton.style.pointerEvents = 'none'
    }

    this.activityIndicator = <ActivityIndicator height={5} color={'#ffffff'} />
    this.forceUpdate()
  }

  handleCancelClick() {
    this.props.canceled()
  }

  render() {
    let { item, mode } = this.props

    return (
      <Container>
        <Wrapper>
          <Section justifyContent={'center'}>
            <Label
              font={'pamainregular'}
              size={2.8}
              color={'#d3d3d3'}
              uppercase
              nowrap
            >
              {item.gameId}
            </Label>
          </Section>

          {item.eventType && item.sportType.name ? (
            <Section
              justifyContent={'center'}
              alignItems={'center'}
              flexDirection={'row'}
              marginTop={1.5}
            >
              <ThisImage
                src={evalImage(item.sportType.icon[0])}
                imageSize={65}
              />
              <Label
                font={'pamainregular'}
                size={2.8}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                &nbsp;{item.eventType},&nbsp;
              </Label>
              <Label
                font={'pamainregular'}
                size={2.8}
                color={'#d3d3d3'}
                uppercase
                nowrap
              >
                {item.sportType.name}
              </Label>
            </Section>
          ) : null}

          <Section
            justifyContent={'center'}
            flexDirection={'row'}
            marginTop={1.5}
          >
            <TeamSection>
              <TeamIconWrap>
                <TeamIcon
                  teamInfo={item.participants[0]}
                  size={3}
                  outsideBorderColor={'#ffffff'}
                  outsideBorderWidth={0.2}
                />
                &nbsp;
                <Label
                  font={'pamainlight'}
                  size={3}
                  marginBottom={3}
                  color={'#d3d3d3'}
                  uppercase
                  nospacing
                >
                  {item.participants[0].name}
                </Label>
              </TeamIconWrap>
              <TeamVS>
                <Label font={'pamainextrabold'} size={2} uppercase>
                  &nbsp;&nbsp;vs&nbsp;&nbsp;
                </Label>
              </TeamVS>
              <TeamIconWrap>
                <TeamIcon
                  teamInfo={item.participants[1]}
                  size={3}
                  outsideBorderColor={'#ffffff'}
                  outsideBorderWidth={0.2}
                />
                &nbsp;
                <Label
                  font={'pamainlight'}
                  size={3}
                  marginBottom={3}
                  color={'#d3d3d3'}
                  uppercase
                  nospacing
                >
                  {item.participants[1].name}
                </Label>
              </TeamIconWrap>
            </TeamSection>
          </Section>

          <Section justifyContent={'center'} marginTop={1}>
            {item.venue && item.venue.city && item.venue.city.name ? (
              <Label font={'pamainregular'} size={2} uppercase nowrap>
                {item.venue.city.name},&nbsp;
              </Label>
            ) : null}
            {item.venue && item.venue.state && item.venue.state.name ? (
              <Label font={'pamainregular'} size={2} uppercase nowrap>
                {item.venue.state.name}&nbsp;-&nbsp;
              </Label>
            ) : null}
            <Label font={'pamainregular'} size={2} uppercase nowrap>
              {item.venue.stadiumName || ''}
            </Label>
          </Section>

          <Section
            justifyContent={'center'}
            alignItems={'center'}
            marginTop={3}
          >
            <DateAndTimeWrap>
              {/*
              <DateAndTimeStart date={dateFormat(item.dateStart, 'mmmm dd, yyyy')} time={item.timeStart}/>
              <DateAndTime color={'#18c5ff'} label={'announce date'} date={dateFormat(item.dateAnnounce, 'mmm. dd, yyyy')} />
              <DateAndTime color={'#0fbc1c'} label={'pre-pick date'} date={dateFormat(item.datePrePicks, 'mmm. dd, yyyy')} />
*/}
              <DateAndTimeStart
                date={dateFormat(item.dateStart, 'mmmm dd, yyyy')}
                time={item.timeStart}
              />
              <DateAndTime
                color={'#18c5ff'}
                label={'announce date'}
                date={dateFormat(item.dateAnnounce, 'mmm. dd, yyyy')}
              />
              <DateAndTime
                color={'#0fbc1c'}
                label={'pre-pick date'}
                date={dateFormat(item.datePrePicks, 'mmm. dd, yyyy')}
              />
            </DateAndTimeWrap>
          </Section>

          <Section
            justifyContent={'center'}
            alignItems={'center'}
            flexDirection={'row'}
            marginTop={4}
          >
            <ThisImage src={OperatorsIcon} imageSize={50} />
            <Label font={'pamainregular'} size={2.8} uppercase nowrap>
              &nbsp;event operators
            </Label>
          </Section>

          <Section justifyContent={'center'} marginTop={6}>
            <CreateEventButton
              isInsert={mode === 'insert' ? true : false}
              innerRef={ref => (this.refCreateEventButton = ref)}
              onClick={this.handleCreateClick.bind(this)}
            >
              {mode === 'insert' ? 'create this event' : 'update this event'}
              {this.activityIndicator}
            </CreateEventButton>
          </Section>
          <Section justifyContent={'center'} marginTop={4}>
            <Label
              font={'pamainregular'}
              size={2}
              color={'#ff0000'}
              uppercase
              nowrap
              cursor={'pointer'}
              innerRef={ref => (this.refCancelButton = ref)}
              onClick={this.handleCancelClick.bind(this)}
            >
              cancel and return back to game{' '}
              {mode === 'insert' ? 'creation' : 'updation'}
            </Label>
          </Section>
        </Wrapper>
      </Container>
    )
  }
}

const Container = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.95);
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Section = styled.div`
  width: 100%;
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
  display: flex;
  ${props => (props.direction ? `flex-direction:${props.direction}` : ``)};
  ${props =>
    props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => (props.alignItems ? `align-items:${props.alignItems};` : ``)};
`

const Label = styled.span`
  height: ${props => vhToPx(props.size * 0.8 || 3)};
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => vhToPx(props.size || 3)};
  color: ${props => props.color || '#ffffff'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => vhToPx(props.nospacing ? 0 : 0.1)};
  cursor: ${props => props.cursor || 'default'};
  margin-bottom: ${props => props.marginBottom || 0}%;
`

const CreateEventButton = styled.div`
  width: ${props => vhToPx(5 * 5)};
  height: ${props => vhToPx(5)};
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-family: pamainbold;
  fonts-size: ${props => vhToPx(5 * 0.6)};
  color: #ffffff;
  letter-spacing: ${props => vhToPx(0.1)};
  text-transform: uppercase;
`
const ThisImage = styled.div`
  width: ${props => vhToPx(3)};
  height: ${props => vhToPx(3)};
  min-width: ${props => vhToPx(3)};
  min-height: ${props => vhToPx(3)};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: ${props => props.imageSize || 65}%;
    background-position: center;
  }
`

const TeamSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TeamIconWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TeamVS = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 2%;
`

const DateAndTimeWrap = styled.div`
  display: flex;
  flex-direction: column;
`

const DateAndTimeStart = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:before {
    content: '${props => props.date}';
    font-family: pamainregular;
    font-size: ${props => vhToPx(3.2)};
    text-transform: uppercase;
    color: #ffffff;
    line-height: 1;
    height: ${props => vhToPx(3.2 * 0.8)};
    margin-right: ${props => vwToPx(1.5)};
    margin-bottom: 1%;
  }
  &:after {
    content: '${props => props.time}';
    font-family: pamainlight;
    font-size: ${props => vhToPx(5)};
    text-transform: uppercase;
    color: #ffffff;
    line-height: 1;
    height: ${props => vhToPx(5 * 0.8)};
    margin-bottom: 2%;
  }
`

const DateAndTime = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => vhToPx(0.7)};
  &:before {
    content: '${props => props.label}';
    font-family: pamainregular;
    font-size: ${props => vhToPx(2.2)};
    text-transform: uppercase;
    color: ${props => props.color || '#ffffff'};
    line-height: 1;
    height: ${props => vhToPx(2.2 * 0.8)};
    margin-bottom: 1%;
    display: flex;
    justify-content: flex-start;
    letter-spacing: ${props => vhToPx(0.1)};
  }
  &:after {
    content: '${props => props.date}';
    font-family: pamainregular;
    font-size: ${props => vhToPx(2.2)};
    text-transform: uppercase;
    color: ${props => props.color || '#ffffff'};
    line-height: 1;
    height: ${props => vhToPx(2.2 * 0.8)};
    margin-bottom: 1%;
    display: flex;
    justify-content: flex-end;
    letter-spacing: ${props => vhToPx(0.1)};
  }
`
