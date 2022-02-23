import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { TweenMax } from 'gsap'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import Star6Icon from '@/assets/images/preplay-sponsor-star6.svg'
import { vhToPx } from '@/utils'
import deepEqual from 'deep-equal'
import '@/styles/sponsor-dropdown.css'
import SponsorItem from '@/Components/Common/BrandItem'

@inject('PrePlayStore')
@observer
export default class DDSponsorBrand extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      selectedItem: null,
      sponsors: this.props.PrePlayStore.sponsors,
      sportTypeNoHover: false,
    })
    this.reference = 'sponsor-option-'
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

  handleSponsorBrandClick() {
    this.toggleSponsorOpenClose()

    // const option = this[this.props.index]
    // if (option) {
    //   if (option.classList.contains('open')) {
    //     this.initOptionEventListener(0)
    //     option.className = option.className.replace(' open', '')
    //     TweenMax.to(option, 0.3, { visibility: 'hidden' })
    //   } else {
    //     setTimeout(() => {
    //       this.initOptionEventListener(1)
    //       option.className += ' open'
    //       TweenMax.to(option, 0.3, { visibility: 'visible' })
    //     }, 0)
    //   }
    // }
  }

  handleOptionItemClick_(val) {
    const option = this[this.props.index]
    if (option) {
      if (option.classList.contains('open')) {
        this.initOptionEventListener(0)
        option.className = option.className.replace(' open', '')
        TweenMax.to(option, 0.3, { visibility: 'hidden', zIndex: -1000 })
      }

      this.selectedItem = val
      this.props.value(val)
    }
  }

  handleSponsorItemClick(cat, brand) {
    this.toggleSponsorOpenClose()
    this.selectedItem = { sponsorCategory: cat, sponsorItem: brand }
    this.props.value(this.selectedItem)

    /**
     * COMMENT THIS
     * IF YOU DON'T WANT TO USE HOVER
     */
    this.sportTypeNoHover = true
    setTimeout(() => (this.sportTypeNoHover = false), 500)
  }

  toggleSponsorOpenClose() {
    const option = this[`${this.reference}${this.props.index}`]
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

  componentDidUpdate(prevProps) {
    if (!deepEqual(prevProps.selectedSponsor, this.props.selectedSponsor)) {
      if (this.props.selectedSponsor && this.props.selectedSponsor.name) {
        this.selectedItem = this.props.selectedSponsor
      }
    }
  }

  componentWillMount() {
    if (
      this.props.selectedSponsor &&
      this.props.selectedSponsor.sponsorItem &&
      this.props.selectedSponsor.sponsorItem.brandId
    ) {
      this.selectedItem = this.props.selectedSponsor
    } else {
      this.selectedItem = null
    }
  }

  render() {
    let { locked, index } = this.props

    return (
      <Scrolling>
        {!this.selectedItem ? (
          <Button
            locked={locked}
            height={this.props.height}
            onClick={locked ? null : this.handleSponsorBrandClick.bind(this)}
          >
            <ItemName>{'BRAND PACKS'}</ItemName>
            <EmptyBrandCircle />
            <EmptyBrandCount></EmptyBrandCount>
          </Button>
        ) : this.selectedItem.sponsorItem ? (
          <Button
            locked={locked}
            height={this.props.height}
            backgroundColor={this.selectedItem.sponsorCategory.backgroundColor}
            onClick={locked ? null : this.handleSponsorBrandClick.bind(this)}
          >
            <SponsorItem
              locked={locked}
              hasBorderBottom={false}
              item={this.selectedItem.sponsorItem}
              //backgroundColor={this.selectedItem.sponsorCategory.backgroundColor}
              //refClick={this.handleSponsorItemClick.bind(this, cat, brand, `${dropdownSponsorItem}-${brand.brandId}`)}
            />
          </Button>
        ) : null}

        <Option>
          <OptionItems
            innerRef={ref =>
              (this[`${this.reference}${this.props.index}`] = ref)
            }
          >
            <nav>
              <ul>
                {this.sponsors.map((cat, idx) => {
                  return (
                    <li
                      key={`li-sponsor-category-${idx}`}
                      //id={dropdownSponsorCategory}
                      ref={ref => (this[`refSponsorCategory-${idx}`] = ref)}
                      //onClick={this.handleCategoryClick.bind(this, idx, dropdownSponsorCategory)}
                      className={this.sportTypeNoHover ? 'nohover' : ''}
                    >
                      <OptionItem
                      // onClick={this.handleOptionItemClick.bind(
                      //   this,
                      //   cat,
                      //   dropdownOptionId
                      // )}
                      // onClick={this.handleCategoryClick.bind(this, cat, idx)}
                      >
                        <Item
                          height={this.props.height}
                          text={cat.name}
                          backgroundColor={cat.backgroundColor}
                        >
                          <ItemName>{cat.name}</ItemName>
                          <CircleWrapper>
                            <ItemOuterBorderCircle
                              borderColor={cat.circleBorderColor}
                              circleFill={cat.circleFill}
                              color={cat.initialColor}
                              text={cat.initial}
                              height={this.props.height}
                            />
                          </CircleWrapper>
                          <CountWrapper>
                            <Count>{cat.count}</Count>
                          </CountWrapper>
                        </Item>
                      </OptionItem>

                      <ul ref={ref => (this[`refSponsortItems-${idx}`] = ref)}>
                        {(cat.brands || []).map((brand, idx) => {
                          if (brand && brand.brandId) {
                            const _cat = { ...cat }
                            delete _cat.brands
                            return (
                              <li
                                key={`li-sponsor-brand-${brand.brandId}`}
                                style={{
                                  width: '100%',
                                  height: vhToPx(this.props.height),
                                  left: '100%',
                                  top: vhToPx(-4.6),
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderLeft: `${vhToPx(0.1)} solid #d3d3d3`,
                                }}
                              >
                                <SponsorItem
                                  hasBorderBottom={
                                    idx < cat.brands.length - 1 ? true : false
                                  }
                                  item={brand}
                                  backgroundColor={_cat.backgroundColor}
                                  refClick={this.handleSponsorItemClick.bind(
                                    this,
                                    _cat,
                                    brand
                                  )}
                                />
                              </li>
                            )
                          } else {
                            return null
                          }
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </OptionItems>
        </Option>
      </Scrolling>
    )
  }
}

const FONT_SIZE = vhToPx(1.8)

const Scrolling = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
`

const Button = styled.div`
  width: inherit;
  height: ${props => vhToPx(props.height)};
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  color: black;
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: ${props => vhToPx(1.5)};

  background-image: url(${props => (props.locked ? '' : UpArrowIcon)});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-size: ${props => FONT_SIZE};
  cursor: ${props => (props.locked ? 'default' : 'pointer')};
`

const EmptyBrandCircle = styled.div`
  width: ${props => vhToPx(4)};
  height: ${props => vhToPx(4)};
  min-width: ${props => vhToPx(4)};
  min-height: ${props => vhToPx(4)};
  border-radius: 50%;
  background-color: #000000;
`
const EmptyBrandCircleX = styled.div`
  width: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: '';
    display: inline-block;
    width: ${props => vhToPx(4)};
    height: ${props => vhToPx(4)};
    border-radius: 50%;
    background-color: #000000;
  }
`
const EmptyBrandCount = styled.div`
  width: 25%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(2)};
  color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
`
const Option = styled.div`
  width: 100%;
  position: relative;
`
const OptionItems = styled.div`
  width: inherit;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  visibility: hidden;
  position: absolute;
  // border: 0.1vh solid #1e90ff;
  z-index: 1000 !important;
`
const OptionItem = styled.div`
  width: auto;
  height: auto;
  min-height: ${props => vhToPx(props.height)};
  position: relative;
  cursor: pointer;
`

const Item = styled.div`
  width: inherit;
  height: ${props => vhToPx(props.height)};
  font-family: pamainbold;
  font-size: ${props => FONT_SIZE};
  text-transform: uppercase;
  color: black;
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-left: ${props => vhToPx(1.5)};
  // &:hover {
  //   opacity: 0.7;
  // }
`

const ItemName = styled.div`
  width: 100%;
  height: inherit;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const CircleWrapper = styled.div`
  width: 30%;
`
const ItemOuterBorderCircle = styled.div`
  width: ${props => vhToPx(4.3)};
  height: ${props => vhToPx(4.3)};
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
    background-image: url(${Star6Icon});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 100%;
*/
  }

  &:after {
    position: absolute;
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(0.8 * props.height)};
    text-transform: uppercase;
    color: ${props => props.color};
    padding-top: ${props => vhToPx(0.2)};
  }
`

const CountWrapper = styled.div`
  width: 25%;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
`
const Count = styled.div`
  font-family: pamainregular;
  font-size: ${props => vhToPx(2)};
  color: #000000;
  font-weight: bold;
`
