import React, { Component } from 'react'
import styled, { keyframes } from 'styled-components'
import { inject } from 'mobx-react'
import { vhToPx, vwToPx } from '@/utils'
import PlayAlongNowIcon from '@/assets/images/PlayAlongNow-Logo_Invert.svg'

@inject('NavigationStore', 'OperatorStore')
export default class Portal extends Component {
  constructor(props) {
    super(props)
    this.menuList = [
      {
        name: 'events',
        backgroundColor: '#18c5ff',
        route: '/gameevents',
        access: this.props.OperatorStore.operator.access.gameAdmin,
        refId: 'portal-events-button',
      },
      {
        name: 'campaigns',
        backgroundColor: '#000000',
        access: false,
        refId: 'portal-campaigns-button',
      },
      {
        name: 'sponsors',
        backgroundColor: '#495bdb',
        access: false,
        refId: 'portal-sponsors-button',
      },
      {
        name: 'prize stars',
        backgroundColor: '#9368aa',
        access: false,
        refId: 'portal-prize-stars-button',
      },
      {
        name: 'access administrators',
        backgroundColor: '#808285',
        nextLine: true,
        access: false,
        refId: 'portal-access-admin-button',
      },
    ]
  }

  handleMenuClick(route) {
    if (route) {
      this.props.NavigationStore.setCurrentView(route)
    }
  }

  render() {
    return (
      <Container>
        <Section marginTop={25} marginBottom={5}>
          <Logo src={PlayAlongNowIcon} />
        </Section>
        <Section marginBottom={1}>
          <TextWrapper>
            <Text
              font={'pamainextrabold'}
              size={2.8}
              color={'#000000'}
              uppercase
            >
              welcome,&nbsp;
              {`${this.props.OperatorStore.operator.firstName} ${this.props.OperatorStore.operator.lastName}`}
            </Text>
          </TextWrapper>
        </Section>
        <Section marginBottom={5}>
          <TextWrapper>
            <Text
              font={'pamainextrabold'}
              size={3.2}
              color={'#808285'}
              uppercase
            >
              senior executive
            </Text>
          </TextWrapper>
        </Section>
        <Section marginBottom={3}>
          <MenuWrap>
            {this.menuList.map((item, idx) => {
              if (!item.nextLine) {
                return (
                  <Menu
                    key={idx}
                    text={item.name}
                    color={item.access ? '#ffffff' : '#8f8f8f'}
                    backgroundColor={
                      item.access ? item.backgroundColor : '#a8a8a8'
                    }
                    margin={idx < this.menuList.length - 1 ? true : false}
                    onClick={
                      item.access
                        ? this.handleMenuClick.bind(this, item.route)
                        : null
                    }
                    isAccess={item.access}
                    id={item.refId}
                  />
                )
              }
            })}
          </MenuWrap>
        </Section>
        <Section marginBottom={2}>
          <MenuWrap>
            <Menu
              key={this.menuList.length}
              text={this.menuList[4].name}
              width={12}
              color={this.menuList[4].access ? '#ffffff' : '#8f8f8f'}
              backgroundColor={
                this.menuList[4].access
                  ? this.menuList[4].backgroundColor
                  : '#a8a8a8'
              }
              isAccess={this.menuList[4].access}
            />
          </MenuWrap>
        </Section>
        <Section>
          <TextWrapper>
            <Text
              font={'pamainextrabold'}
              size={1.4}
              color={'rgba(0,0,0, 0.4)'}
              letterSpacing={0}
              uppercase
            >
              choose admin access
            </Text>
          </TextWrapper>
        </Section>
      </Container>
    )
  }
}

const Container = styled.div`
  width: ${props => vwToPx(100)};
  height: ${props => vhToPx(100)};
  display: flex;
  flex-direction: column;
  background-color: #eaeaea;
  animation: 0.4s ${props => fadeIn} forwards;
`

const fadeIn = keyframes`
  0%{
    opacity: 0;
  }
  100%{
    opacity:1;
  }
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  ${props => (props.center ? 'align-items: center;' : '')};
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
`

const Logo = styled.img`
  height: ${props => vhToPx(8)};
`

const TextWrapper = styled.div`
  text-align: center;
`

const Text = styled.span`
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
  ${props =>
    props.letterSpacing ? `letter-spacing:${props.letterSpacing}` : ''};
`

const MenuWrap = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-self: center;
`

const Menu = styled.div`
  width: ${props => vwToPx(props.width || 9)};
  height: ${props => vhToPx(6)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.isAccess ? 'pointer' : 'default')};
  ${props => (props.margin ? `margin-right: ${vwToPx(2)}` : ``)};
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(5 * 0.4)};
    color: ${props => props.color};
    text-transform: uppercase;
    line-height: 1;
    height: ${props => vhToPx(5 * 0.4 * 0.8)};
    letter-spacing: ${props => vhToPx(0.1)};
    margin-bottom: ${props => vhToPx(0.1)};
  }
`
