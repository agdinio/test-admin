import React, { Component } from 'react'
import styled  from 'styled-components'
import { vhToPx, evalImage } from '@/utils'
import TeamIcon from '@/Components/Common/TeamIcon'
import dateFormat from 'dateformat'
import OperatorsIcon from '@/assets/images/icon-list-black.svg'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'
//----------import CheckIcon from '@/assets/images/cancel-confirmation.svg'

export default class CancelModal extends Component {
  constructor(props) {
    super(props);
  }

  handleConfirmationClick(args) {
      if ('executive' === args) {
        this[`confirm-executive`].style.backgroundColor = '#d3d3d3';
        this[`confirm-director`].style.backgroundColor = 'transparent';
        this[`confirm-executive`].style.color = '#c61818';
        this[`confirm-director`].style.color = '#d3d3d3';
        this[`check-executive`].style.visibility = 'visible';
        this[`check-director`].style.visibility = 'hidden';
      } else {
        this[`confirm-executive`].style.backgroundColor = 'transparent';
        this[`confirm-director`].style.backgroundColor = '#d3d3d3';
        this[`confirm-executive`].style.color = '#d3d3d3';
        this[`confirm-director`].style.color = '#c61818';
        this[`check-executive`].style.visibility = 'hidden';
        this[`check-director`].style.visibility = 'visible';
      }
  }

  handleCancelClick() {
    this.props.canceled()
  }

  render() {

    let { item } = this.props
    console.log('TEAMS.', item)

    const vs = `${item.participants[0].name} vs ${item.participants[1].name}`
    const venue = `at ${item.venue.stadiumName || ''}`
    const gameId = item.gameId

    return (
      <Container>
        <Wrapper>
          <Section justifyContent={'center'}>
            <Label font={'pamainregular'} size={4.2} color={'#d3d3d3'} uppercase nowrap>you are about to&nbsp;</Label>
            <Label font={'pamainregular'} size={4.2} color={'#c61818'} uppercase nowrap>cancel&nbsp;</Label>
            <Label font={'pamainregular'} size={4.2} color={'#d3d3d3'} uppercase nowrap>the game event</Label>
          </Section>

          <Section justifyContent={'center'} marginTop={2}>
            <Label font={'pamainregular'} size={4.2} color={'#d3d3d3'} uppercase nowrap>{vs}&nbsp;</Label>
            <Label font={'pamainregular'} size={4.2} color={'#d3d3d3'} uppercase nowrap>{venue}&nbsp;(</Label>
            <Label font={'pamainbold'} size={4.2} color={'#d3d3d3'} uppercase nowrap>{gameId}</Label>
            <Label font={'pamainregular'} size={4.2} color={'#d3d3d3'} uppercase nowrap>)</Label>
          </Section>

          <Section justifyContent={'center'} marginTop={3}>
            <Label font={'pamainregular'} size={3.8} color={'#a7a9ac'} uppercase nowrap>1 executive producer or chief & 1 executive director must confirm</Label>
          </Section>

          <Section justifyContent={'center'} direction={'row'} marginTop={4}>
            <ConfirmIcon src={evalImage(`@/assets/images/cancel-confirmation.svg`)} key={`check-executive`} innerRef={ref => this[`check-executive`] = ref} />
            <ConfirmationButton
              key={`confirm-executive`}
              text={'executive confirmation'}
              innerRef={ref => this[`confirm-executive`] = ref}
              onClick={this.handleConfirmationClick.bind(this, 'executive')}
            />
            <div style={{width:vhToPx(5)}} />
            <ConfirmationButton
              key={`confirm-director`}
              text={'director confirmation'}
              innerRef={ref => this[`confirm-director`] = ref}
              onClick={this.handleConfirmationClick.bind(this, 'director')}
            />
            <ConfirmIcon src={evalImage(`@/assets/images/cancel-confirmation.svg`)} key={`check-director`} innerRef={ref => this[`check-director`] = ref} />
          </Section>

          <Section justifyContent={'center'} marginTop={10}>
            <Label font={'pamainregular'} size={2.4} color={'#a7a9ac'} uppercase nowrap>choose reason</Label>
          </Section>

          <Section justifyContent={'center'} direction={'row'} marginTop={1.5}>
            <ReasonButton
              key={'reason-datechange'}
              backgroundColor={'#5ac3f9'}
              color={'#000000'}
              text={'date change'}
              marginRight={5}
            />
            <ReasonButton
              key={'reason-indefinitepause'}
              backgroundColor={'#f5b840'}
              color={'#000000'}
              text={'indefinite pause'}
              marginRight={5}
            />
            <ReasonButton
              key={'reason-fullcancel'}
              backgroundColor={'#c61818'}
              color={'#ffffff'}
              text={'full cancel'}
            />
          </Section>

          <Section justifyContent={'center'} marginTop={4}>
            <Label font={'pamainbold'} size={2} color={'#a7a9ac'} uppercase nowrap style={{cursor:'pointer'}} onClick={this.handleCancelClick.bind(this)}>cancel</Label>
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
  background-color: rgba(0,0,0, 0.95);
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
  ${props => props.direction ? `flex-direction:${props.direction}` : ``};
  ${props => props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => props.alignItems ? `align-items:${props.alignItems};` : ``};
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

const ConfirmIcon = styled.div`
  width: ${props => vhToPx(5)};
  height: ${props => vhToPx(5)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 ${props => vhToPx(0.5)} 0 ${props => vhToPx(0.5)};
  visibility: hidden;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
  }
`

const ConfirmationButton = styled.div`
  width: ${props => vhToPx(28)}
  height: ${props => vhToPx(5)}
  border: ${props => `${vhToPx(0.2)} solid #d3d3d3`};
  display: flex;
  justify-content: center;
  align-items: center;
  color: #d3d3d3;
  cursor: pointer;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(5 * 0.4)};
    text-transform: uppercase;
    line-height: 1;
    height: ${props => vhToPx(5 * 0.4)};
  }
`

const ReasonButton = styled.div`
  width: ${props => vhToPx(20)}
  height: ${props => vhToPx(5)}
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => props.color || '#000000'};
  background-color: ${props => props.backgroundColor};
  cursor: pointer;
  margin-right: ${props => vhToPx(props.marginRight || 0)};
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(5 * 0.4)};
    text-transform: uppercase;
    line-height: 1;
    height: ${props => vhToPx(5 * 0.4)};
  }
`
