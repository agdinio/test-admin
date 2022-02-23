import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import icon_arrow_right from '@/assets/images/icon-arrow.svg'
import styled, { keyframes } from 'styled-components'
import { vhToPx } from '@/utils'

@observer
export default class GlowingButton extends Component {
  constructor(props) {
    super(props)

    extendObservable(this, {
      buttonText: this.props.text || 'CONTINUE',
      right: 0,
      buttonIcon: null,
    })
  }

  componentDidMount() {
    this.right = this.buttonIcon ? this.buttonIcon.offsetWidth : 0
  }
  componentDidUpdate() {
    this.right = this.buttonIcon ? this.buttonIcon.offsetWidth : 0
  }

  render() {
    return (
      <ButtonContainer
        inherit={this.props.inherit}
        disabled={this.props.disabled}
        height={this.props.height}
        onClick={this.props.disabled ? null : this.props.handleButtonClick}
      >
        <ButtonText inherit={this.props.inherit}>
          {this.buttonText}
          <img alt="Glowing Arrow" src={icon_arrow_right} />
        </ButtonText>
        <ButtonTextOver right={this.right} inherit={this.props.inherit}>
          {this.buttonText}
        </ButtonTextOver>
      </ButtonContainer>
    )
  }
}

const InvertedImg = styled.img`
  filter: invert(100%);
`

const ButtonGlowing = keyframes`
  0% { box-shadow: 0 0 0px rgba(255,255,255,0); }
  100% { box-shadow: 0 0 40px rgba(255,255,255,1); }
`
const ButtonContainer = styled.div`
  line-height:1;
  width: 100%;
  height: ${props => vhToPx(props.height || 12)};
  max-height: 90px;
  border-radius: ${props => vhToPx(0.5)};
  ${props => (props.inherit ? 'width:100%;text-align:center;' : '')}
  position:relative;
  user-select: none;
  border: ${props => vhToPx(0.3)} solid #ffffff;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: ${props => vhToPx(1.4)} ${props => vhToPx(3)};
  background-color: transparent;
  transition: 1s;
  ${props =>
    props.disabled
      ? null
      : `animation: ${ButtonGlowing} 1s alternate linear infinite;`}
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.7 : 1)};

  &:hover {
    ${props => (props.disabled ? null : 'background-color: #ffffff;')}
    ${props => (props.disabled ? null : 'transition: 0.2s;')}
  }

  &:hover ${props => ButtonTextOver}{
    ${props => (props.disabled ? null : 'opacity: 1;')}
    ${props => (props.disabled ? null : 'z-index: 1;')}
    ${props => (props.disabled ? null : 'transition: justify-content 0.4s;')}
    justify-content:center;
  }


  &:hover ${props => ButtonText} {
    ${props => (props.disabled ? null : 'opacity: 0;')}
    ${props => (props.disabled ? null : 'transition: 0s;')}
  }
`

const ButtonText = styled.span`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  width: 100%;
  user-select: none;
  font-size: ${props => vhToPx(4.5)};
  font-family: pamainbold;
  color: #ffffff;
  transition: opacity 1s;
  //--position: absolute;
`

const ButtonTextOver = styled.div`
  opacity: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  user-select: none;
  font-size: ${props => vhToPx(4.5)};
  font-family: pamainbold;
  color: #000000;
  transition: opacity justify-content 1s;
  position: absolute;
`
