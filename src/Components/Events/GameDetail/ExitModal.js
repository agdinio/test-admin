import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx } from '@/utils'

export default class ExitModal extends Component {
  render() {
    return (
      <Container>
        <Wrapper>
          {/*<Section justifyContent={'center'}>*/}
          {/*  <Label font={'pamainregular'} size={4.2} color={'#d3d3d3'} uppercase nowrap>any unsaved changes will be lost.</Label>*/}
          {/*</Section>*/}
          {/*<Section justifyContent={'center'} marginTop="2">*/}
          {/*  <Label font={'pamainregular'} size={4.2} color={'#d3d3d3'} uppercase nowrap>are you sure you want to leave this page?</Label>*/}
          {/*</Section>*/}
          <Section justifyContent={'center'}>
            <Label
              font={'pamainregular'}
              size={4.2}
              color={'#d3d3d3'}
              uppercase
              nowrap
            >
              You have unsaved changes on this page.
            </Label>
          </Section>
          <Section justifyContent={'center'} marginTop="2">
            <Label
              font={'pamainregular'}
              size={4.2}
              color={'#d3d3d3'}
              uppercase
              nowrap
            >
              Do you want to leave this page and discard your changes?
            </Label>
          </Section>
          <Section justifyContent={'center'} direction={'row'} marginTop="3">
            <Button>leave</Button>
            <Label
              font={'pamainregular'}
              size={2}
              color={'#d3d3d3'}
              uppercase
              nowrap
            >
              or
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

const Button = styled.div`
  width: ${props => vhToPx(18)};
  height: ${props => vhToPx(7)};
  border-radius: ${props => vhToPx(0.2)};
  background-color: #18c5ff;
  color: #ffffff;
  font-family: pamainlight;
  font-size: ${props => vhToPx(3)};
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`
