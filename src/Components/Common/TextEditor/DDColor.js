import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import { vhToPx } from '@/utils'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'

const ColorList = [
  {
    color: '#000000',
    default: true,
    defaultColor: '#e6e7e8',
  },
  {
    color: '#17c4fe',
  },
  {
    color: '#ffb600',
  },
  {
    color: '#efdf17',
  },
  {
    color: '#c61818',
  },
  {
    color: '#0fbc1c',
  },
]

@observer
export default class DDColor extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      selItem: ColorList.filter(o => o.default)[0],
    })
  }

  initOptionEventListener(mode) {
    let func = evt => {
      const option = this[this.props.index]

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

  handleButtonClick() {
    const option = this[this.props.index]
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

  handleOptionItemClick(c) {
    const option = this[this.props.index]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }

      this.props.value(c.color)
      this.selItem = c
    }
  }

  componentDidMount() {
    if (this.props.defaultColor) {
      const c = ColorList.filter(o => o.color === this.props.defaultColor)[0]
      if (c) {
        this.props.value(c.color)
        this.selItem = c
      }
    } else {
      this.selItem = ColorList.filter(o => o.default)[0]
    }
  }

  render() {
    let { height, index, locked, hidden } = this.props

    return (
      <Scrolling hidden={hidden}>
        <Button
          locked={locked}
          height={height}
          default={this.selItem.default}
          backgroundColor={
            this.selItem.default
              ? this.selItem.defaultColor
              : this.selItem.color
          }
          onClick={locked ? null : this.handleButtonClick.bind(this)}
        >
          <VerticalLine default={this.selItem.default} />
        </Button>
        <Option>
          <OptionItems
            innerRef={ref => (this[index] = ref)}
          >
            {ColorList.map((c, idx) => {
              return (
                <OptionItem
                  key={idx}
                  height={height}
                  onClick={this.handleOptionItemClick.bind(
                    this,
                    c
                  )}
                >
                  <ColorItem height={height} backgroundColor={c.color} />
                </OptionItem>
              )
            })}
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

const Scrolling = styled.div`
  width: ${props => vhToPx(5)};
  display: flex;
  flex-direction: column;
  letter-spacing: ${props => vhToPx(0.1)};
  visibility: ${props => (props.hidden ? 'hidden' : 'visible')};
`

const Button = styled.div`
  width: ${props => vhToPx(5)};
  height: ${props => vhToPx(props.height)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
  overflow: hidden;

  &:after {
    width: ${props => vhToPx(2.1)};
    height: ${props => vhToPx(2.1)};
    content: '';
    display: inline-block;
    background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
    background-repeat: no-repeat;
    background-position: right ${props => vhToPx(-0.5)};
    background-size: contain;
    transform: rotate(135deg);
  }
`

const VerticalLine = styled.div`
  width: ${props => vhToPx(0.4)};
  height: ${props => vhToPx(8)};
  ${props => (props.default ? 'background-color:#bcbec0' : '')};
  transform: rotate(44deg);
  margin-bottom: ${props => vhToPx(-1.4)};
`

const Option = styled.div`
  width: inherit;
`

const OptionItems = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  visibility: hidden;
  position: absolute;
  z-index: 1000 !important;
`

const OptionItem = styled.div`
  width: auto;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => vhToPx(props.height)};
`

const ColorItem = styled.div`
  width: ${props => vhToPx(5)};
  height: ${props => vhToPx(props.height)};
  background-color: ${props => props.backgroundColor};
`
