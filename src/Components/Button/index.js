import React, { PureComponent } from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import icon_arrow_right from '@/assets/images/icon-arrow.svg'
import styled, { keyframes } from 'styled-components'
import { vhToPx } from '@/utils'

export default class GlowingButton extends PureComponent {
  constructor(props) {
    super(props)

    extendObservable(this, {
      buttonText: this.props.text || 'CONTINUE',
      buttonAttr: {},
    })
  }

  componentWillMount() {
    if (this.props.padding) {
      this.buttonAttr['paddingTop'] = vhToPx(this.props.padding.top || 1.4)
      this.buttonAttr['paddingBottom'] = vhToPx(
        this.props.padding.bottom || 1.4
      )
      this.buttonAttr['paddingLeft'] = vhToPx(this.props.padding.left || 3)
      this.buttonAttr['paddingRight'] = vhToPx(this.props.padding.right || 3)
    } else {
      this.buttonAttr['paddingTop'] = vhToPx(1.4)
      this.buttonAttr['paddingBottom'] = vhToPx(1.4)
      this.buttonAttr['paddingLeft'] = vhToPx(3)
      this.buttonAttr['paddingRight'] = vhToPx(3)
    }

    this.buttonAttr['fontSize'] = vhToPx(4.8)
    this.buttonAttr['buttonTextPaddingTop'] = vhToPx(0.4)
    this.buttonAttr['marginLeftTextOver'] = vhToPx(
      this.props.marginLeftBtnTextOver || -2.9
    )
    this.buttonAttr['arrowSize'] = vhToPx(this.props.arrowSize || 4.5)
  }

  render() {
    return (
      <ButtonContainer
        inherit={this.props.inherit}
        disabled={this.props.disabled}
        padding={this.props.padding || {}}
        onClick={this.props.disabled ? null : this.props.handleButtonClick}
        attr={this.buttonAttr}
      >
        <ButtonText inherit={this.props.inherit} attr={this.buttonAttr}>
          {this.buttonText}
        </ButtonText>
        <ButtonIcon
          size={this.props.arrowSize}
          src={icon_arrow_right}
          marginLeft={this.props.marginLeftBtnIcon}
          attr={this.buttonAttr}
        />
        <ButtonTextOver
          right={this.right}
          inherit={this.props.inherit}
          marginLeft={this.props.marginLeftBtnTextOver}
          attr={this.buttonAttr}
        >
          {this.buttonText}
        </ButtonTextOver>
      </ButtonContainer>
    )
  }
}

const ButtonContainer = styled.div`
  user-select: none; 
  position: relative;
  border: ${props => vhToPx(0.3)} solid #ffffff;
  border-radius: ${props => vhToPx(0.5)};
  display: inline-flex;
  justify-content: center;
  align-items: center;
/*
  padding-top: ${props => vhToPx(props.padding.top || 1.4)};
  padding-bottom: ${props => vhToPx(props.padding.bottom || 1.4)};
  padding-left: ${props => vhToPx(props.padding.left || 3)}
  padding-right: ${props => vhToPx(props.padding.right || 3)}
*/
  padding-top: ${props => props.attr.paddingTop};
  padding-bottom: ${props => props.attr.paddingBottom};
  padding-left: ${props => props.attr.paddingLeft};
  padding-right: ${props => props.attr.paddingRight};

  background-color: transparent;
  transition: 1s;
  animation: ${props => ButtonGlowing} 1s alternate linear infinite;
  line-height: 1.6;
  
  &:hover {
    ${props =>
      props.disabled ? null : 'background-color: #ffffff;cursor: pointer;'}
    ${props => (props.disabled ? null : 'transition: 0.2s;cursor: pointer;')}
  }

  &:hover ${props => ButtonTextOver} {
    ${props => (props.disabled ? null : 'opacity: 1;')}
    ${props => (props.disabled ? null : 'z-index: 1;')}
    ${props => (props.disabled ? null : 'margin-left: 0;')}
    ${props => (props.disabled ? null : 'transition: 0.4s;')}
  }

  &:hover ${props => ButtonText} {
    ${props => (props.disabled ? null : 'opacity: 0;')}
    ${props => (props.disabled ? null : 'transition: 0s;')}
  }
`

const ButtonText = styled.span`
  user-select: none;
  //font-size: ${props => vhToPx(4.8)};
  font-size: ${props => props.attr.fontSize};
  font-family: pamainbold;
  color: #ffffff;
  display: inline-block;
  transition: opacity 1s;
  //padding-top: ${props => vhToPx(0.4)};
  padding-top: ${props => props.attr.buttonTextPaddingTop};
`

const ButtonIcon = styled.img`
  //height: ${props => vhToPx(props.size || 4.5)};
  height: ${props => props.attr.arrowSize};
  margin-left: ${props =>
    props.marginLeft ? vhToPx(props.marginLeft) : vhToPx(2)};
  display: inline-block;
`

const ButtonTextOver = styled.div`
  user-select: none;
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  //font-size: ${props => vhToPx(4.8)};
  font-size: ${props => props.attr.fontSize};
  font-family: pamainbold;
  color: #000000;
  z-index: -1;
/*
  margin-left: ${props =>
    props.marginLeft ? vhToPx(props.marginLeft) : vhToPx(-2.9)};
*/
  margin-left: ${props => props.attr.marginLeftTextOver};
  transition: 0.4s;
  opacity: 0;
`

const ButtonGlowing = keyframes`
  0% { box-shadow: 0 0 0 rgba(255,255,255,0); }
  100% { box-shadow: 0 0 ${vhToPx(7)} rgba(255,255,255,1); }
`
