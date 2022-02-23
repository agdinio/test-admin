import React, { Component } from 'react'
import styled from 'styled-components'
import { inject } from 'mobx-react'
import { vhToPx, vwToPx } from '@/utils'

@inject('NavigationStore')
export default class ServerError extends Component{

  handleReloadClick() {
    window.location.reload();
    this.props.NavigationStore.setCurrentView('/gameevents')
  }

  render() {
    return (
      <Container>
        <Section alignItems="center" direction="column">
          <Label font="pamainregular" size="5" color="#ffffff" uppercase style={{marginBottom:vhToPx(2)}}>server is temporary unavailable.</Label>
          <Label font="pamainregular" size="5" color="#ffffff" uppercase style={{marginBottom:vhToPx(2)}}>please contact backend administrator</Label>
          <Section direction="row" alignItems="center" justifyContent="center">
            <Label font="pamainregular" size="5" color="#ffffff" uppercase>or click</Label>
            <ReloadButton onClick={this.handleReloadClick.bind(this)} />
          </Section>
        </Section>
      </Container>
    )
  }
}

const Container = styled.div`
  width: ${props => vwToPx(100)};
  height: ${props => vhToPx(100)};
  background-color: #000000;
  display: flex;
  align-items: center;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  // display: flex;
  // justify-content: center;
  // align-items: center;
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

const ReloadButton = styled.div`
  width: ${props => vhToPx(22)};
  height: ${props => vhToPx(7)};
  border-radius: ${props => vhToPx(0.4)};
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-left: 2%;
  &:hover {
    opacity: 0.8;
  }
  &:after {
    content: 'reload';
    font-family: pamainregular;
    font-size: ${props => vhToPx(7 * 0.5)};
    color: #ffffff;
    text-transform: uppercase;
    line-height: 1;
    height: ${props => vhToPx((7 * 0.5) * 0.75)};
    letters-spacing: ${props => vhToPx(0.1)};
    margin-bottom: 1%;
  }
`
