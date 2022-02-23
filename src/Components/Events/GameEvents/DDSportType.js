import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'
import '@/styles/sporttype-dropdown.css'
import { vhToPx, vwToPx, evalImage } from '@/utils'
const h = 5

@observer
export default class DDSportType extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      sportTypeNoHover: false,
    })

    this.selectedSportType = null
    this.selectedSubSportGenre = null
  }

  handleSportTypeHover(type) {
    this.selectedSportType = type
    const el = this[`sporttype-${type.code}`]
    const elImg = this[`sporttype-image-${type.code}`]
    const elText = this[`sporttype-text-${type.code}`]
    if (el && elImg && elText) {
      el.style.backgroundColor = '#000'
      elImg.src = evalImage(type.icon[1])
      elText.style.color = '#ffffff'
    }
  }

  handleSportTypeOut(type) {
    const el = this[`sporttype-${type.code}`]
    const elImg = this[`sporttype-image-${type.code}`]
    const elText = this[`sporttype-text-${type.code}`]
    if (el && elImg && elText) {
      el.style.backgroundColor = '#515151'
      elImg.src = evalImage(type.icon[1])
      elText.style.color = '#fff'
    }
  }

  handleFindEventClick(sportType, subSportGenre) {
    this.props.findEvent({
      sportType: sportType ? sportType.code : '',
      subSportGenre: subSportGenre ? subSportGenre.code : '',
    })
    this.sportTypeNoHover = true
    this.selectedSportType = sportType
    this.selectedSubSportGenre = subSportGenre
    setTimeout(() => (this.sportTypeNoHover = false), 500)
  }

  handleEventTypeClick(option) {
    this.selectedSubSportGenre = option

    this.sportTypeNoHover = true
    setTimeout(() => (this.sportTypeNoHover = false), 500)

    console.log(
      'VALUES',
      JSON.parse(JSON.stringify(this.props.GameEventStore.values))
    )
  }

  handleSubSportGenreHover(code) {
    const elSportType = this[`sporttype-${this.selectedSportType.code}`]
    if (elSportType) {
      this.handleSportTypeHover(this.selectedSportType)
    }
  }

  handleSubSportGenreOut(code) {
    this.handleSportTypeOut(this.selectedSportType)
  }

  handleBaseDropdownClick() {
    if (this.refBaseDropdown) {
      this.refBaseDropdown.querySelector('ul').style.display = 'inherit'
    }
  }

  handleSportTypeClick(code) {
    if (this[`sporttype-li-${code}`]) {
      this[`sporttype-li-${code}`].querySelector('ul').style.display = 'inherit'
    }
  }

  render() {
    let { sportTypes } = this.props

    return (
      <Container>
        <Section>
          <nav>
            <ul>
              <li className={this.sportTypeNoHover ? 'nohover' : ''}>
                {/*<li onClick={this.handleBaseDropdownClick.bind(this)} ref={ref => this.refBaseDropdown = ref}>*/}
                <SportTypeButton id="sporttype-filter-button">
                  {this.selectedSportType &&
                  Object.keys(this.selectedSportType).length > 0 ? (
                    <SportTypeSelected
                      key={`sporttype-selected-${this.selectedSportType.code}`}
                      text={this.selectedSportType.name}
                      color={'#ffffff'}
                      src={evalImage(this.selectedSportType.icon[1])}
                      backgroundColor={'#000'}
                      opacity={1}
                    />
                  ) : (
                    <SportTypeEmpty />
                  )}
                </SportTypeButton>
                <ul>
                  {sportTypes.map(stype => {
                    stype.eventTypes
                    return (
                      <li
                        key={stype.code}
                        style={{ borderBottom: `${vhToPx(0.1)} solid #fff` }}
                        /*
                        onClick={this.handleSportTypeClick.bind(this, stype.code)}
                        ref={ref =>this[`sporttype-li-${stype.code}`] = ref}
*/
                      >
                        <SportType
                          innerRef={ref =>
                            (this[`sporttype-${stype.code}`] = ref)
                          }
                          onMouseOver={this.handleSportTypeHover.bind(
                            this,
                            stype
                          )}
                          onMouseOut={this.handleSportTypeOut.bind(this, stype)}
                          onClick={this.handleFindEventClick.bind(
                            this,
                            stype,
                            null
                          )}
                          id={`sporttype-item-${stype.code}`}
                        >
                          <SportTypeImage
                            src={evalImage(stype.icon[1])}
                            innerRef={ref =>
                              (this[`sporttype-image-${stype.code}`] = ref)
                            }
                          />
                          <Label
                            font={'pamainbold'}
                            size={h * 0.4}
                            color={'#fff'}
                            uppercase
                            nowrap
                            innerRef={ref =>
                              (this[`sporttype-text-${stype.code}`] = ref)
                            }
                          >
                            {stype.name}
                          </Label>
                        </SportType>

                        <ul>
                          {stype.eventTypes.map(etype => {
                            return (
                              <li
                                key={`${stype.code}-${etype.code}`}
                                className="header-dropdown-sporttype"
                                style={{
                                  borderBottom: `${vhToPx(0.1)} solid #fff`,
                                  borderLeft: `${vhToPx(0.1)} solid #fff`,
                                }}
                              >
                                <EventType
                                  text={etype.name}
                                  color={'#fff'}
                                  backgroundColor={'#515151'}
                                  onMouseOver={this.handleSubSportGenreHover.bind(
                                    this,
                                    etype.code
                                  )}
                                  onMouseOut={this.handleSubSportGenreOut.bind(
                                    this,
                                    etype.code
                                  )}
                                  onClick={this.handleFindEventClick.bind(
                                    this,
                                    stype,
                                    etype
                                  )}
                                  id={`subsportgenre-item-${etype.code}`}
                                />
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </Section>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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

const SportTypeButton = styled.div`
  width: ${props => vhToPx(20)};
  height: ${props => vhToPx(h)};
  display: flex;
  cursor: pointer;
  border-bottom-style: solid;
  border-bottom-width: ${props => vhToPx(0.1)};
  border-bottom-color: #fff;
`

const SportTypeSelected = styled.div`
  width: 100%;
  height: ${props => vhToPx(h * 0.95)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  &:before {
    width: ${props => vhToPx(h)};
    height: ${props => vhToPx(h)};
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
    opacity: ${props => props.opacity};
    margin: 0 ${props => vhToPx(1)} 0 ${props => vhToPx(1)};
  }
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    text-transform: uppercase;
    font-size: ${props => vhToPx(h * 0.4)};
    height: ${props => vhToPx(h * 0.4 * 0.8)};
    line-height: 1;
    color: ${props => props.color};
    opacity: ${props => props.opacity};
  }

`

const SportTypeEmpty = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #fff;
  align-items: center;
  justify-content: space-between;
  border: ${props => vhToPx(0.2)} solid #000;
  &:before {
    content: 'FILTER';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.4)};
    color: #000;
    line-height: 1;
    letter-spacing: ${props => vhToPx(0.1)};
    margin-left: 5%;
  }
  &:after {
    width: ${props => vhToPx(h)};
    height: ${props => vhToPx(h)};
    content: '';
    display: inline-block;
    background-image: url(${props => evalImage(`icon-filter.svg`)});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
  }
`

const SportType = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #515151;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`

const SportTypeImage = styled.img`
  height: ${props => vhToPx(h * 0.7)};
  margin: 0 ${props => vhToPx(1.5)} 0 ${props => vhToPx(1.5)};
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

const EventType = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  align-items: center;
  cursor: pointer;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    text-transform: uppercase;
    font-size: ${props => vhToPx(h * 0.4)};
    height: ${props => vhToPx(h * 0.4 * 0.8)};
    line-height: 1;
    color: ${props => props.color};
  }
  padding-left: ${props => vhToPx(1.5)}

  &:hover {
    background-color: #000;
    &:after {
      color: #fff;
      opacity: 1;
    }
  }

`
