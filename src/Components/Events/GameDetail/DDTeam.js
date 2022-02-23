import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import LockIcon from '@/assets/images/icon-lock-black.svg'
import Team from '@/Components/Common/TeamIcon'
import { vhToPx } from '@/utils'
import {isEqual} from 'lodash'

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
}

@observer
export default class DDTeam extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      selectedTeam: null,
    })
    h = this.props.height
  }

  initOptionEventListener(mode) {
    let func = evt => {
      const option = this[`team-option-${this.props.index}`]

      if (option) {
        let targetElement = evt.target // clicked element

        do {
          if (targetElement == option) {
            // This is a click inside. Do nothing, just return.
            return
          }
          // Go up the DOM
          targetElement = targetElement.parentNode
        } while (targetElement)

        // This is a click outside.
        if (option.classList.contains('open')) {
          option.className = option.className.replace(' open', '')
          TweenMax.to(option, 0.3, { visibility: 'hidden' })
        }
        document.removeEventListener('click', func)
      }
    }

    if (mode === 0) {
      document.removeEventListener('click', func)
    } else {
      document.addEventListener('click', func)
    }
  }

  handleOptionClick() {
    const option = this[`team-option-${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden' })
      } else {
        setTimeout(() => {
          this.initOptionEventListener(1)
          option.className += ' open'
          TweenMax.to(option, 0.3, { visibility: 'visible' })
        }, 0)
      }
    }
  }

  handleOptionItemClick(_selectedTeam) {
    this.selectedTeam = _selectedTeam

    const option = this[`team-option-${this.props.index}`]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }
    }

    if (this.props.selectedTeam) {
      this.props.selectedTeam(_selectedTeam)
    }
  }

  componentDidUpdateX(prevProps) {
    if (
      !isEqual(prevProps.headerSelectedTeam, this.props.headerSelectedTeam)
    ) {
      this.selectedTeam = this.props.headerSelectedTeam
      if (this.props.playItemValue) {
        this.props.playItemValue(this.props.headerSelectedTeam)
      }
    }
  }

  componentWillReceivePropsX(nextProps) {
    if (nextProps.headerSelectedTeam) {
      this.selectedTeam = nextProps.headerSelectedTeam
      if (this.props.playItemValue) {
        this.props.playItemValue(nextProps.headerSelectedTeam)
      }
      //const newVal = JSON.parse(JSON.stringify(nextProps.headerSelectedTeam))
      //this.props.value(newVal)
    }

    /*
    if (nextProps.presetToNone) {
      //this.props.value(null)
    } else {
      if (nextProps.headerSelectedTeam) {
        this.selectedTeam = nextProps.headerSelectedTeam
        //this.props.value(nextProps.headerSelectedTeam)
      }
    }
*/
  }

  componentWillMount() {
/*
    if (this.props.item.team && this.props.item.team.teamName) {
      this.selectedTeam = this.props.teams.filter(
        o =>
          o.teamName.trim().toLowerCase() ===
          this.props.item.team.teamName.trim().toLowerCase()
      )[0]
    } else {
      this.selectedTeam = this.props.headerSelectedTeam
    }
*/

    //this.props.value(this.selectedTeam)

    if (this.props.item.forParticipant && Object.keys(this.props.item.forParticipant).length > 0) {
      this.selectedTeam = this.props.item.forParticipant
    } else {
      this.selectedTeam = this.props.teams[0]
    }

  }

  render() {
    let { locked, reference, presetToNone } = this.props

    return (
      <Scrolling>
        <Button
          innerRef={reference}
          locked={locked}
          onClick={locked ? null : this.handleOptionClick.bind(this)}
        >
          {this.selectedTeam ? (
            <AvailTeam key={`selected-${this.selectedTeam.id}-${this.selectedTeam.iconTopColor}-${this.selectedTeam.iconBottomColor}`}>
              <TeamCircleWrapper>
                <Team
                  teamInfo={this.selectedTeam}
                  size={2.5}
                  outsideBorderColor={'#000000'}
                  outsideBorderWidth={0.1}
                />
              </TeamCircleWrapper>
            </AvailTeam>
          ) : (
            <NoTeam withLock={presetToNone} />
          )}
        </Button>
        <Option>
          <OptionItems
            innerRef={ref => (this[`team-option-${this.props.index}`] = ref)}
          >
            {
              this.props.teams.map((t, idx) => {
                return (
                  <OptionItem key={`${idx}-${t.iconTopColor}-${t.iconBottomColor}`}>
                    <TeamOptionWrapper
                      height={this.props.height}
                      onClick={this.handleOptionItemClick.bind(this, t)}
                    >
                      <TeamCircleWrapper>
                        <Team
                          teamInfo={t}
                          size={2.5}
                          outsideBorderColor={'#000000'}
                          outsideBorderWidth={0.1}
                        />
                      </TeamCircleWrapper>
                    </TeamOptionWrapper>
                  </OptionItem>
                )
              })
            }
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

const FONT_SIZE = vhToPx(1.8)

let h = 0

const Scrolling = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  letter-spacing: ${props => vhToPx(0.1)};
  position: relative;
`

const Button = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #ffffff;
  display: flex;
  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-size: ${props => FONT_SIZE};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`
const AvailTeam = styled.div`
  width: inherit;
  height: ${props => vhToPx(h)};
  display: flex;
  justify-content: center;
  align-items: center;
`
const NoTeam = styled.div`
  width: inherit;
  height: ${props => vhToPx(h)};
  display: flex;
  align-items: center;
  &:hover {
    background-color: ${props => props.backgroundColor};
  }
  &:before {
    content: 'NONE';
    margin-left: ${props => vhToPx(props.withLock ? 2 : 0)};
  }
  &:after {
    width: inherit;
    height: ${props => vhToPx(props.height)};
    content: '';
    display: inline-block;
    background-image: url(${props => (props.withLock ? LockIcon : '')});
    background-repeat: no-repeat;
    background-size: 30%;
    background-position: center;
  }
`
const TeamOptionWrapper = styled.div`
  width: inherit;
  height: ${props => vhToPx(h)};
  background-color: #ffffff;
  display: flex;
  justify-content: center
  align-items: center;
  &:hover {
    background-color: ${props => props.backgroundColor};
  }
`
const TeamLabel = styled.div`
  width: 100%;
  height: inherit;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 10%;
`
const TeamCircleWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Option = styled.div`
  width: 100%;
  min-width: 100%;
`
const OptionItems = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  visibility: hidden;
  position: absolute;
  border: ${props => vhToPx(0.1)} solid #1e90ff;
  z-index: 1000 !important;
`
const OptionItem = styled.div`
  width: 100%;
  height: auto;
  min-height: ${props => vhToPx(h)};
`
