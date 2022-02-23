import React, { Component } from 'react'
import styled from 'styled-components'
import { inject } from 'mobx-react'
import { vhToPx, vwToPx } from '@/utils'

@inject('NavigationStore')
export default class Unauthorized extends Component{

  handleToLoginPageClick() {
    this.props.NavigationStore.setCurrentView('/login')
  }

  render() {
    return (
      <Container>
        <Section justifyContent="center" marginTop="25">
          <Label font="pamainregular" size="5" color="#000000" uppercase>(401) token expired!</Label>
        </Section>
        <Section justifyContent="center" marginTop="5">
          <ToLoginPageButton onClick={this.handleToLoginPageClick.bind(this)} />
        </Section>
      </Container>
    )
  }
}

const Container = styled.div`
  width: ${props => vwToPx(100)};
  height: ${props => vhToPx(100)};
  background-color: #ffffff;
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

const ToLoginPageButton = styled.div`
  width: ${props => vhToPx(25)};
  height: ${props => vhToPx(6)};
  border-radius: ${props => vhToPx(0.4)};
  background-color: #ffc107;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
  &:after {
    content: 'click to re-login';
    font-family: pamainregular;
    font-size: ${props => vhToPx(6 * 0.5)};
    color: #ffffff;
    text-transform: uppercase;
    line-height: 1;
    height: ${props => vhToPx((6 * 0.5) * 0.75)};
    letters-spacing: ${props => vhToPx(0.1)};
    margin-bottom: 1%;
  }
`
