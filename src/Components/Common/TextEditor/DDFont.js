import React, { Component } from 'react'
import styled from 'styled-components'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import { vhToPx } from '@/utils'

const FontLabels = {
  pamainlight: 'THIN',
  pamainregular: 'REG',
  pamainbold: 'BOLD',
  pamainextrabold: 'XTRA',
}

const FontList = [
  {
    font: 'pamainlight',
  },
  {
    font: 'pamainregular',
  },
  {
    font: 'pamainbold',
  },
  {
    font: 'pamainextrabold',
  },
]

@observer
export default class DDFont extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      selItem: FontList[0]
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

  handleOptionItemClick(f) {
    const option = this[this.props.index]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }

      this.props.value(f.font)
      this.selItem = f
    }
  }

  componentDidMount() {
    if (this.props.defaultFont) {
      const f = FontList.filter(o => o.font === this.props.defaultFont)[0]
      if (f) {
        this.props.value(f.font)
        this.selItem = f
      }
    } else {
      this.selItem = FontList[0]
    }
  }

  render() {
    let { height, index, locked, hidden } = this.props

    return (
      <Scrolling hidden={hidden}>
        <Button
          locked={locked}
          height={height}
          font={this.selItem.font}
          onClick={locked ? null : this.handleButtonClick.bind(this)}
        >
          {FontLabels[this.selItem.font]}
        </Button>
        <Option>
          <OptionItems
            innerRef={ref => this[index] = ref}
          >
            {FontList.map((f, idx) => {
              return (
                <OptionItem
                  key={idx}
                  height={height}
                  onClick={this.handleOptionItemClick.bind(
                    this,
                    f
                  )}
                >
                  <FontItem height={height} font={f.font}>
                    {FontLabels[f.font]}
                  </FontItem>
                </OptionItem>
              )
            })}
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

const FONT_SIZE = vhToPx(2)

const Scrolling = styled.div`
  width: ${props => vhToPx(6)};
  display: flex;
  flex-direction: column;
  letter-spacing: ${props => vhToPx(0.1)}
  visibility: ${props => (props.hidden ? 'hidden' : 'visible')};
`

const Button = styled.div`
  width: ${props => vhToPx(6)}
  height: ${props => vhToPx(props.height)};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ${props => props.font};
  font-size: ${props => FONT_SIZE};
  font-color: #000000;
  background-color: #ffffff;
  text-decoration: underline;
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
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

const FontItem = styled.div`
  width: ${props => vhToPx(6)};
  height: ${props => vhToPx(props.height)};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ${props => props.font};
  font-size: ${props => FONT_SIZE};
  font-color: #000000;
  text-decoration: underline;
`
