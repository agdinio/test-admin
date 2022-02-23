import React, { Component } from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { vhToPx } from '@/utils'
import { SketchPicker } from 'react-color'

@observer
export default class ParticipantItem extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
  }

  handleTeamNameChange(e) {
    this.props.item.name = e.target.value
    this.props.item.initial = e.target.value.charAt(0)
    this.props.teamUpdated(true)
  }

  handleInitialChange(e) {
    this.props.item.initial = e.target.value
    this.props.teamUpdated(true)
  }

  handleColorClick(pos) {
    if (pos === 'top') {
      this.props.item.showTopColorPicker = true
    } else {
      this.props.item.showBottomColorPicker = true
    }
  }

  handleChangeColor(pos, color) {
    if (pos === 'top') {
      this.props.item.topColor = color.hex
    } else {
      this.props.item.bottomColor = color.hex
    }
  }

  handleColorClose(pos) {
    if (pos === 'top') {
      this.props.item.showTopColorPicker = false
    } else {
      this.props.item.showBottomColorPicker = false
    }

    this.props.teamUpdated(true)
  }

  handleRemoveTeamClick(id) {
    const idxToRemove = this.props.participants.findIndex(o => o.id === id)
    if (idxToRemove > -1) {
      this.props.participants.splice(idxToRemove, 1);
    }
  }

  render() {
    let { item } = this.props

    return (
      <Container>
        <Wrapper>
          <InputInitial
            type="text"
            value={item.initial}
            onChange={this.handleInitialChange.bind(this)}
          />
          <InputTeamName
            type="text"
            placeholder="name"
            value={item.name}
            onChange={this.handleTeamNameChange.bind(this)}
          />
          <TeamColorCircleWrapper>
            <Outer>
              <Inner>
                <InnerTop bgColor={item.topColor} />
                <InnerBottom bgColor={item.bottomColor} />
              </Inner>
              <InnerLine />
            </Outer>
          </TeamColorCircleWrapper>
          <ColorTop
            value={item.topColor}
            onClick={this.handleColorClick.bind(this, 'top')}
          />
          {item.showTopColorPicker ? (
            <div style={{ position: 'absolute', zIndex: 2 }}>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
                onClick={this.handleColorClose.bind(this, 'top')}
              />
              <SketchPicker
                color={item.topColor}
                onChange={this.handleChangeColor.bind(this, 'top')}
              />
            </div>
          ) : null}

          <ColorBottom
            value={item.bottomColor}
            onClick={this.handleColorClick.bind(this, 'bottom')}
          />
          {item.showBottomColorPicker ? (
            <div style={{ position: 'absolute', zIndex: 2 }}>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}
                onClick={this.handleColorClose.bind(this, 'bottom')}
              />
              <SketchPicker
                color={item.bottomColor}
                onChange={this.handleChangeColor.bind(this, 'bottom')}
              />
            </div>
          ) : null}

          {/*<Remove onClick={this.handleRemoveTeamClick.bind(this, item.id)} />*/}
        </Wrapper>
      </Container>
    )
  }
}

let h = 0
const Container = styled.div`
  width: 100%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.45)};
  margin-top: ${props => vhToPx(0.2)};
`

const Wrapper = styled.div`
  width: inherit;
  display: flex;
  justify-content: space-between;
`

const InputInitial = styled.input`
  width: ${props => vhToPx(h)};
  height: ${props => vhToPx(h)};
  background-color: #000000;
  color: #ffffff;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  border: none;
  -webkit-appearance: none;
  text-align: center;
`
const InputTeamName = styled.input`
  width: 50%;
  height: ${props => vhToPx(h)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  text-indent: ${props => vhToPx(1)};
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(0.1)};
  &::placeholder {
    color: #cccccc;
  }
  &::-ms-input-placeholder {
    color: #cccccc;
  }
  &::-webkit-input-placeholder {
    color: #cccccc;
  }
`

const TeamColorCircleWrapper = styled.div`
  width: ${props => vhToPx(h)};
  height: ${props => vhToPx(h)};
  min-width: ${props => vhToPx(h)};
  min-height: ${props => vhToPx(h)};
  border-radius: ${props => vhToPx(h)};
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
`
const Outer = styled.div`
  width: 95%;
  height: 95%;
  border-radius: 50%;
  overflow: hidden;
`

const Inner = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
`
const InnerTop = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.bgColor};
`
const InnerBottom = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.bgColor};
`

const InnerLine = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  display: flex;
  color: #ffffff;
  justify-content: center;
  align-items: center;
  &:after {
    content: '-';
  }
`

const ColorWrapper = styled.div`
  display: inline-block;
  cursor: pointer;
`

const ColorTop = styled.div`
  width: ${props => vhToPx(9)};
  height: ${props => vhToPx(h)};
  background-color: ${props => props.backgroundColor || '#fff'};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${props => vhToPx(0.2)};
  cursor: pointer;
  &:after {
    content: '${props => props.value}';
    color: ${props => props.value};
    font-family: pamainregular;
    text-transform: uppercase;
  }
`

const ColorBottom = styled.div`
  width: ${props => vhToPx(9)};
  height: ${props => vhToPx(h)};
  background-color: ${props => props.backgroundColor || '#fff'};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: '${props => props.value}';
    color: ${props => props.value};
    font-family: pamainregular;
    text-transform: uppercase;
  }
`

const Swatch = styled.div`
  padding: 5px;
  background: #fff;
  borderradius: 1px;
  display: inline-block;
  cursor: pointer;
`
const ColorSwatch = styled.div`
  width: 36px;
  height: 14px;
  borderradius: 2px;
  background: white;
`

const Remove = styled.div`
  height: ${props => vhToPx(h)};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background-color: #a7a9ac;
  &:after {
    content: 'x';
    font-size: ${props => vhToPx(h)};
    font-weight: bold;
    padding: ${props => `0 ${vhToPx(1)} ${vhToPx(0.7)} ${vhToPx(1)}`};
    opacity: 0.3;
  }
  &:hover:after {
    opacity: 1;
  }
`
