import React, { Component } from 'react'
import styled  from 'styled-components'
import { vhToPx, vwToPx, isEqual, evalImage } from '@/utils'

export default class SponsorItem extends Component {
  constructor(props) {
    super(props)
    w = this.props.width
    h = this.props.height
  }

  render() {

    let { item, inactive } = this.props

    return (
      <Container>
        <Wrapper backgroundColor={item.backgroundColor}>
          <ItemName>{item.name}</ItemName>
          <CircleWrapper>
            <ItemOuterBorderCircle
              borderColor={item.circleBorderColor}
              circleFill={item.circleFill}
              color={item.initialColor}
              text={item.initial}
            />
          </CircleWrapper>
        </Wrapper>
        {
          inactive ? (<InactiveCover />) : null
        }
      </Container>
    )
  }
}

let w = 0
let h = 0
const Container = styled.div`
  position: relative;
  width: ${props => vhToPx(w)};
  height: ${props => vhToPx(h)};
  display: flex;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  text-transform: uppercase;
  color: black;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => `0 ${vhToPx(1.5)} 0 ${vhToPx(1.5)}`};
`

const ItemName = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const CircleWrapper = styled.div`
  //width: 30%;
`
const ItemOuterBorderCircle = styled.div`
  width: ${props => vhToPx(h * 0.85)};
  height: ${props => vhToPx(h * 0.85)};
  min-width: ${props => vhToPx(h * 0.85)};
  min-height: ${props => vhToPx(h * 0.85)};
  border-radius: 50%;
  border: ${props => vhToPx(0.3)} solid #ffffff;  
  display: flex;
  justify-content: center;
  align-items: center;  
  &:before {
    content: '';
    display: inline-block;    
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: ${props => vhToPx(0.3)} solid ${props => props.borderColor};  
    background-color: ${props => props.circleFill};
/*
    background-image: url('');
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%;
*/
  }

  &:after {
    position: absolute;
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(0.8 * h)};
    text-transform: uppercase;
    color: ${props => props.color};
    padding-top: ${props => vhToPx(0.2)};
    line-height: 1;
  }
`

const InactiveCover = styled.div`
  position: absolute;
  width: 100%;
  height: 100%; 
  background-color: rgba(0,0,0,0.7);
`
