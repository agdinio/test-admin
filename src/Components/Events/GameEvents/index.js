import React, { Component } from 'react'
import { extendObservable, intercept } from 'mobx'
import { inject, observer } from 'mobx-react'
import styled from 'styled-components'
import { vhToPx, vwToPx, evalImage } from '@/utils'
import GameEventItem from '@/Components/Events/GameEvents/GameEventItem'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'
import FootBallIcon from '@/assets/images/icon-football.svg'
import BasketballIcon from '@/assets/images/icon-basketball.svg'
import GolfIcon from '@/assets/images/icon-golf.svg'
import ProfileDefaultIcon from '@/assets/images/icon-profile_default.svg'
import dateFormat from 'dateformat'
import moment from 'moment-timezone'
import DateAndTimeTick from './DateAndTimeTick'
import ServerError from '@/Components/Common/ServerError'
import DDSportType from './DDSportType'
import agent from '@/Agent'

const buttonEvents = [
  {
    text: 'all',
    code: 'all',
    icon: null,
    selected: false,
  },
  {
    text: 'football',
    code: 'fb',
    icon: FootBallIcon,
    selected: false,
  },
  {
    text: 'basketball',
    code: 'bb',
    icon: BasketballIcon,
    selected: false,
  },
  {
    text: 'golf',
    code: 'golf',
    icon: GolfIcon,
    selected: false,
  },
]

@inject('GameEventStore', 'NavigationStore', 'OperatorStore')
@observer
export default class GameEvents extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      events: null,
      showPage: false,
      showErrorPage: false,
    })

    this.isFinding = false

    this.destroyUpdatedGame = intercept(
      this.props.GameEventStore,
      'updatedGame',
      change => {
        if (change.newValue) {
          for (let i = 0; i < this.events.length; i++) {
            const event = this.events[i].events.filter(
              o => o.gameId === change.newValue.gameId
            )[0]
            if (event) {
              if (change.newValue.dateEndSession) {
                event.stage = change.newValue.stage || 'pending'
                event.dateEndSession = change.newValue.dateEndSession
                event.isFootageRecorded = change.newValue.isFootageRecorded
                break
              }
            }
          }
        }
        return change
      }
    )
  }

  handleCreateGameEventClick() {
    this.props.GameEventStore.resetUnchangedValues()
    this.props.GameEventStore.resetValues()
    this.props.NavigationStore.setCurrentView('/gamedetail')
  }

  handleFindEventClick(option) {
    if (!option) {
      return
    }

    this.isFinding = true
    this.props.GameEventStore.resetActiveSlidingItem()
    this.props.GameEventStore.resetTempCounter()

    this.props.GameEventStore.resetBadge()
    this.events = null

    setTimeout(() => {
      this.props.GameEventStore.getEventsBySportType(option)
        .then(data => {
          this.isFinding = false
          this.events = data
        })
        .catch(err => {
          this.showErrorPage = true
        })
    }, 0)
  }
  handleFindEventClickOLD(option) {
    return
    if (!option) {
      return
    }

    this.isFinding = true
    this.props.GameEventStore.resetActiveSlidingItem()
    this.props.GameEventStore.resetTempCounter()

    buttonEvents.forEach(button => {
      if (button.code.toLowerCase() === option.toLowerCase()) {
        button.selected = true
      } else {
        button.selected = false
      }
    })

    this.props.GameEventStore.resetBadge()
    this.events = null
    setTimeout(() => {
      // this.props.GameEventStore.getEventsBySportType(option === 'all' ? '' : option).then(res => {
      //   this.events = res
      // })
      this.props.GameEventStore.getEventsBySportType(
        option === 'all' ? '' : option
      )
        .then(data => {
          this.isFinding = false
          this.events = data
        })
        .catch(err => {
          this.showErrorPage = true
        })
    }, 0)
  }

  handleLeapChange() {
    this.props.GameEventStore.isLeap = !this.props.GameEventStore.isLeap
  }

  handleUpdateGameEventItem(item, args) {
    const idx = this.events.findIndex(
      o =>
        o.keySportType.code === args.sportType &&
        o.subSportGenreCode === args.subSportGenre
    )
    if (idx > -1) {
      this.events.splice(idx, 1)
    }
  }

  componentWillUnmount() {
    this.destroyUpdatedGame()
  }

  componentDidMount() {
    agent.GameServer.connectSC()

    this.props.GameEventStore.readGameEventInfo()
      .then(next => {
        if (next) {
          this.showPage = true
          this.showErrorPage = false
        }
      })
      .catch(err => {
        this.showPage = true
        this.showErrorPage = true
      })
  }

  render() {
    if (!this.showPage) {
      return (
        <Container>
          <FetchingIndicator>
            <ActivityIndicator color={'#ffffff'} height={5} />
          </FetchingIndicator>
        </Container>
      )
    }

    if (this.showErrorPage) {
      return (
        <Container>
          <ServerError />
        </Container>
      )
    }

    let { events } = this
    let { GameEventStore, OperatorStore } = this.props

    return (
      <Container>
        <Header>
          <HeaderLeft>
            <Text
              font={'pamainextrabold'}
              size={2.8}
              color={'#000'}
              nowrap
              uppercase
            >
              events list
            </Text>
            {/*
           {
             buttonEvents.map((btn, idx) => {
               return (
                 <EventImage
                   selected={btn.selected}
                   key={idx}
                   src={btn.icon}
                   text={btn.icon ?  null : btn.text}
                   innerRef={ref => this[`event-${btn.text}`] = ref}
                   onClick={this.handleFindEventClick.bind(this, btn.code)}
                 />
               )
             })
           }
*/}

            <DDSportTypeWrap>
              <DDSportType
                sportTypes={GameEventStore.sportTypes}
                findEvent={this.handleFindEventClick.bind(this)}
              />
            </DDSportTypeWrap>
          </HeaderLeft>
          <HeaderRight>
            {/*
           <LeapWrap>
             <Text font={'pamainextrabold'} size={3} color={'#000'} nowrap uppercase>leap</Text>
             <input type="checkbox" style={{width:vhToPx(2.5), height:vhToPx(2.5), marginLeft:vhToPx(1), marginBottom:vhToPx(0.5)}} checked={this.props.GameEventStore.isLeap} onChange={this.handleLeapChange.bind(this)} />
           </LeapWrap>
*/}
            <DateAndTimeWrap>
              <DateAndTimeTick />
            </DateAndTimeWrap>
            <BadgeWrap>
              {Object.keys(GameEventStore.badges).map(key => {
                return (
                  <Badge key={key}>
                    <BadgeSquare
                      backgroundColor={GameEventStore.gameStatus[key].bg}
                    />
                    <BadgeCircle>{GameEventStore.badges[key]}</BadgeCircle>
                  </Badge>
                )
              })}
            </BadgeWrap>
          </HeaderRight>
        </Header>

        <Content>
          {events && events.length > 0 ? (
            events.map(item => {
              return (
                <GameEventItem
                  eventItem={item}
                  key={`${item.keyEventType}-${item.keySportType.code}`}
                  updateGameEventItem={this.handleUpdateGameEventItem.bind(
                    this,
                    item
                  )}
                />
              )
            })
          ) : this.isFinding ? (
            <ActivityIndicator color={'#000000'} height={10} />
          ) : !events ? null : (
            'GAME EVENT(S) NOT FOUND'
          )}
        </Content>

        <Footer>
          <CurrentUserWrap>
            <CurrentUser
              text={`${OperatorStore.operator.firstName} ${OperatorStore.operator.lastName} - ${OperatorStore.operator.groupName}`}
            ></CurrentUser>
            <ThisImage src={ProfileDefaultIcon} />
          </CurrentUserWrap>
          <CreateGameEventButton
            onClick={this.handleCreateGameEventClick.bind(this)}
          >
            create new game event session +
          </CreateGameEventButton>
        </Footer>
      </Container>
    )
  }
}

let h = 5

const Container = styled.div`
  width: 100%;
  height: 100%;
`

const Header = styled.div`
  width: 100%;
  height: ${props => vhToPx(12)};
  background-color: #ffffff;
  position: fixed;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  padding: 0 1.5% 0 1.5%;
`

const Content = styled.div`
  width: 100%;
  height: 100%;
  margin-top: ${props => vhToPx(12)};
  margin-bottom: ${props => vhToPx(5)};
  padding: 0 1.5% 0 1.5%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: ${props => vwToPx(2.8)};
`

const Footer = styled.div`
  width: 100%;
  height: ${props => vhToPx(5)};
  position: fixed;
  bottom: 0;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
`

const CurrentUserWrap = styled.div`
  width: 28%;
  height: 100%;
  background-color: #939598;
  display: flex;
  justify-content: space-between;
`

const CurrentUser = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: ${props => vhToPx(2)};
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.4)};
    color: #ffffff;
    line-height: 1;
    height: ${props => vhToPx(h * 0.4 * 0.75)};
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
  }
`

const ThisImage = styled.div`
  width: ${props => vhToPx(h)};
  height: ${props => vhToPx(h)};
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: 80%;
  background-position: center;
  margin-right: ${props => vhToPx(2)};
`

const CreateGameEventButton = styled.div`
  width: 72%;
  height: 100%;
  background-color: #18c5ff;
  display: flex;
  justify-content: center;
  align-items: center
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(2.8)};
  color: #000000;
  text-transform: uppercase;
  padding-top: ${props => vhToPx(0.5)};
  cursor: pointer;
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
  letter-spacing: ${props => vhToPx(props.nospacing ? 0 : 0.1)};
`

const HeaderLeft = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const HeaderRight = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const LeapWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: ${props => vhToPx(5)};
`

const DateAndTimeWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const BadgeWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const EventAll = styled.div`
  width: ${props => vhToPx(5)};
  height: ${props => vhToPx(5)};
  background-color: #18c5ff;
  margin-left: ${props => vhToPx(3)};
  &:after {
    width: ${props => vhToPx(5)};
    height: ${props => vhToPx(5)};
    content: 'ALL';
    font-family: pamainextrabold;
    font-size: ${props => vhToPx(3)};
    color: #000000;
    line-height: 1;
    text-transform: uppercase;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`

const EventImage = styled.div`
  width: ${props => vhToPx(5)};
  height: ${props => vhToPx(5)};
  background-color: ${props => (props.selected ? '#18c5ff' : 'transparent')};
  margin-left: ${props => vhToPx(3)};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:before {
    content: '';
    width: 100%;
    height: 100%;
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 80%;
  }
  &:after {
    position: absolute;
    content: '${props => props.text}';
    font-family: pamainextrabold;
    font-size: ${props => vhToPx(3)};
    color: #000000;
    line-height: 1;
    text-transform: uppercase;
  }
`

const Badge = styled.div`
  display: flex;
  margin-left: ${props => vhToPx(1)};
`
const BadgeSquare = styled.div`
  width: ${props => vhToPx(3.7)};
  height: ${props => vhToPx(3.7)};
  background-color: ${props => props.backgroundColor};
  display: flex;
`

const BadgeCircle = styled.div`
  width: ${props => vhToPx(2.5)};
  height: ${props => vhToPx(2.5)};
  min-width: ${props => vhToPx(2.5)};
  min-height: ${props => vhToPx(2.5)};
  border-radius: ${props => vhToPx(1.25)};
  background-color: #6d6e71;
  margin-left: ${props => vhToPx(-1.25)};
  margin-top: ${props => vhToPx(-0.5)};
  font-family: pamainregular;
  font-size: ${props => vhToPx(2.5 * 0.75)};
  color: #ffffff;
  text-align: center;
`

const FetchingIndicator = styled.div`
  width: 100%;
  height: 100%;
  background-color: #222222;
  position: absolute;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: 'fetching required data';
    font-family: pamainregular;
    font-size: ${props => vhToPx(2.5)};
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
  }
`

const DDSportTypeWrap = styled.div`
  width: auto;
  height: auto;
  margin-left: 10%;
`
