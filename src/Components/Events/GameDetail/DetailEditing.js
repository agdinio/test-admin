import React, { Component, forwardRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable, runInAction } from 'mobx'
import { vhToPx, vwToPx, isEqual, evalImage, diffHours } from '@/utils'
import dateFormat from 'dateformat'
import EditingCalendar from './EditingCalendar'
import EditingVenue from './EditingVenue'
import EditingDateStart from './EditingDateStart'
import TeamIcon from '@/Components/Common/TeamIcon'
import EditIcon from '@/assets/images/icon-pen.svg'
import OperatorsIcon from '@/assets/images/icon-list.svg'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import EmailIcon from '@/assets/images/icon-email.svg'
import SMSIcon from '@/assets/images/icon-sms.svg'
import AppIcon from '@/assets/images/icon-app.svg'
import Operators from '@/Components/Events/GameDetail/Operators'
import { TweenMax, TimelineMax } from 'gsap'
import moment from 'moment-timezone'
import config from '@/Agent/config'
import CryptoJS from 'crypto-js'
import crypto from 'crypto'
import subDays from 'date-fns/subDays'
import DatePicker from 'react-datepicker'
import DropdownRecordedGame from './DropdownRecordedGame'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'

const stageColors = {
  active: {
    text: 'active',
    color: '#939598',
    subText: '(non-public)',
    subColor: '#939598',
  },
  public: {
    text: 'public',
    color: '#18c5ff',
    subText: '(announced)',
    subColor: '#939598',
  },
  pregame: { text: 'PRE-GAME', color: '#22ba2c' },
  pending: { text: 'PENDING', color: '#ccb300' },
  live: { text: 'LIVE', color: '#c61818' },
}

@inject('GameEventStore', 'OperatorStore')
@observer
export default class DetailEditing extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      modal: null,
      timeStartEditing: false,
    })

    this.toggleScrollingHover = null
    this.scrolling = false
    h = this.props.GameEventStore.baseHeight
    //this.defaultValues = JSON.parse(JSON.stringify(this.props.GameEventStore.values))
  }

  handleEdit(which) {
    let editingDateType = null
    let editingDate = null

    const toggleOperators = () => {
      const elArea = document.getElementById('editing-operators-area')
      const elSection = document.getElementById('editing-operators-section')
      if (elArea) {
        if (elArea.classList.contains('open')) {
          elArea.className = elArea.className.replace(' open', '')
          new TimelineMax({ repeat: 0 })
            .to(elArea, 0.3, {
              height: vhToPx(5 * 0.75),
              opacity: 0,
              zIndex: 0,
            })
            .set(elSection, {
              opacity: 1,
              onComplete: () => {
                this.toggleScrolling()
              },
            })
        } else {
          elArea.className += ' open'
          new TimelineMax({ repeat: 0 })
            .set(elSection, { opacity: 0 })
            .to(elArea, 0.3, { height: vhToPx(5) })
            .to(elArea, 0, {
              height: 'auto',
              opacity: 1,
              zIndex: 9,
              onComplete: () => {
                this.toggleScrolling()
              },
            })
        }
      }
    }

    const dates = {
      dateStart: this.props.GameEventStore.values.dateStart,
      dateAnnounce: this.props.GameEventStore.values.dateAnnounce,
      datePrePicks: this.props.GameEventStore.values.datePrePicks,
    }

    const handleDateUpdated = res => {
      this.props.GameEventStore.values[res.dateType] = dateFormat(
        res.date,
        'yyyy-mm-dd 00:00:00'
      )
    }

    const handleDatePrepareUpdate = res => {
      editingDateType = res.dateType
      editingDate = res.date
    }

    const handleContinue = () => {
      this.props.GameEventStore.values[editingDateType] = dateFormat(
        editingDate,
        'yyyy-mm-dd 00:00:00'
      )
      const _prepickDate = subDays(
        new Date(this.props.GameEventStore.values.dateStart),
        2
      )
      this.modal = null
    }

    const closeModal = () => {
      this.modal = null
    }

    const toggleDateAnnounce = () => {
      const elButton = document.getElementById('editing-dateAnnounce-button')
      if (elButton) {
        this.modal = (
          <Modal key="modal-dateAnnounce">
            <CalendarWrap
              key="calenderwrap-dateAnnounce"
              style={{ top: `${elButton.offsetTop}px` }}
            >
              <EditingCalendar
                dateUpdated={handleDateUpdated.bind(this)}
                key="calender-dateAnnounce"
                dates={dates}
                top={elButton.offsetTop}
                hoverColor={'#18c5ff'}
                dateType={'dateAnnounce'}
                dateRangeSelectable={{
                  start: new Date(),
                  end: new Date(this.props.GameEventStore.values.dateAnnounce),
                  isAfterEndDateSelectable: false,
                }}
              />
              <EditButton
                key="editingbutton-dateAnnounce"
                backgroundColor={'transparent'}
                onClick={closeModal.bind(this)}
              />
            </CalendarWrap>
          </Modal>
        )
      }
    }

    const toggleDatePrePicks = () => {
      const elButton = document.getElementById('editing-datePrePicks-button')
      if (elButton) {
        this.modal = (
          <Modal key="modal-datePrePicks">
            <CalendarWrap
              key="calenderwrap-datePrePicks"
              style={{ top: `${elButton.offsetTop}px` }}
            >
              <EditingCalendar
                dateUpdated={handleDateUpdated.bind(this)}
                key="calender-datePrePicks"
                dates={dates}
                top={elButton.offsetTop}
                hoverColor={'#22ba2c'}
                dateType={'datePrePicks'}
                dateRangeSelectable={{
                  start: new Date(
                    this.props.GameEventStore.values.dateAnnounce
                  ),
                  end: new Date(this.props.GameEventStore.values.datePrePicks),
                  isAfterEndDateSelectable: true,
                }}
              />
              <EditButton
                key="editingbutton-datePrePicks"
                backgroundColor={'transparent'}
                onClick={closeModal.bind(this)}
              />
            </CalendarWrap>
          </Modal>
        )
      }
    }

    const toggleDateStart = () => {
      const elButton = document.getElementById('editing-dateStart-button')
      if (elButton) {
        this.modal = (
          <Modal key="modal-dateStart">
            <EditingDateStart close={closeModal.bind(this)} />
          </Modal>
        )
      }
    }

    const toggleTimeStart = () => {
      this.timeStartEditing = !this.timeStartEditing
      // const container = document.getElementById('datetime-justify')
      // if (container) {
      //   if (container.classList.contains('open')) {
      //     container.className = container.className.replace(' open', '')
      //     this.timeStartEditing = false
      //   } else {
      //     container.className += ' open'
      //     this.timeStartEditing = true
      //   }
      // }
    }

    const toggleVenue = () => {
      const elButton = document.getElementById('editing-venue-button')
      if (elButton) {
        this.modal = (
          <Modal key="modal-venue">
            <EditingVenue close={closeModal.bind(this)} />
          </Modal>
        )
      }
    }

    switch (which) {
      case 'operators':
        toggleOperators()
        break
      case 'dateAnnounce':
        toggleDateAnnounce()
        break
      case 'datePrePicks':
        toggleDatePrePicks()
        break
      case 'timeStart':
        toggleTimeStart()
        break
      case 'dateStart':
        toggleDateStart()
        break
      case 'venue':
        toggleVenue()
        break
      default:
        break
    }
  }

  handlePushOperator(newOp) {
    if (!this.props.GameEventStore.values.operators) {
      this.props.GameEventStore.values.operators = []
      this.props.GameEventStore.values.operators.push(newOp)
    } else {
      this.props.GameEventStore.values.operators.push(newOp)
    }
    this.toggleScrolling()
  }

  handleRemoveOperator(idx) {
    this.props.GameEventStore.values.operators.splice(idx, 1)
    this.toggleScrolling()
  }

  handleAdjustPosition() {
    /**
     * ADJUST POSITION OF CALENDAR BASED ON BUTTON POSITION
     **/
    // this.modal = (
    //   <Modal>
    //     <EditingCalendar/>
    //   </Modal>
    // )

    //console.log(this.refContainer.offsetHeight, this.refButton.offsetTop, this.refMod.offsetHeight)

    const top = this.refButton.offsetTop + this.refMod.offsetHeight
    const maxTop = this.refContainer.offsetHeight
    if (top > maxTop) {
      this.refMod.style.top =
        this.refButton.offsetTop -
        this.refMod.offsetHeight +
        this.refButton.offsetHeight +
        'px'
    } else {
      this.refMod.style.top = this.refButton.offsetTop + 'px'
    }

    console.log(
      this.refContainer.offsetLeft,
      this.refMod.offsetLeft,
      this.refButton.offsetLeft
    )
    const left = this.refButton.offsetLeft - this.refMod.offsetWidth
    console.log(left)
    if (left < 0) {
      //this.refMod.style.left = ((this.refButton.offsetLeft + this.refMod.offsetWidth) -this.refButton.offsetWidth) + 'px';
      //this.refMod.style.left = ((this.refButton.offsetLeft + this.refMod.offsetWidth) - this.refMod.offsetWidth) + 'px'
      //this.refMod.style.left = ((this.refButton.offsetLeft - this.refContainer.offsetLeft) + this.refMod.offsetWidth) + 'px'

      //this.refMod.style.left = ((this.refMod.offsetWidth) + this.refButton.offsetWidth) + 'px'

      this.refMod.style.left =
        this.refButton.offsetLeft + this.refButton.offsetWidth + 'px'
    } else {
      //this.refMod.style.left = ((this.refContainer.offsetLeft + this.refButton.offsetLeft) - this.refMod.offsetWidth) + 'px';
      this.refMod.style.left =
        this.refButton.offsetLeft - this.refMod.offsetWidth + 'px'
    }

    //ok
    //this.refMod.style.left = ((this.refContainer.offsetLeft + this.refButton.offsetLeft) - this.refMod.offsetWidth) + 'px';
  }

  handleTimeChange(e) {
    this.props.GameEventStore.values.timeStart = e.target.value
  }

  parse(val) {
    return JSON.parse(JSON.stringify(val))
  }

  componentDidUpdate() {
    const parse = val => {
      return JSON.parse(JSON.stringify(val))
    }

    if (
      this.props.GameEventStore.unchangedValues &&
      this.props.GameEventStore.unchangedValues.gameId
    ) {
      if (
        !isEqual(
          parse(this.props.GameEventStore.unchangedValues),
          parse(this.props.GameEventStore.values)
        )
      ) {
        this.props.GameEventStore.setUpdating(true)
      } else {
        this.props.GameEventStore.setUpdating(false)
      }
    }
  }

  toggleScrolling() {
    if (this.refContainer) {
      if (this.refContainer.offsetHeight < this.refContainer.scrollHeight) {
        runInAction(() => (this.scrolling = true))
      } else {
        runInAction(() => (this.scrolling = false))
      }

      this.forceUpdate()
    }
  }

  handleAccessHComm() {
    this.props.GameEventStore.accessHComm(this.props.GameEventStore.values)

    /*
    const info = {
      gameId: this.props.GameEventStore.values.gameId,
      username: 'ab@local.com',
      password: 'SportocoToday.v1',
      isLeap: this.props.GameEventStore.leap.isLeap,
      executionType: !this.props.GameEventStore.values.leapType ? 'normal' : this.props.GameEventStore.values.leapType === 'recording' ? (this.props.GameEventStore.values.dateEndSession && new Date() > new Date(this.props.GameEventStore.values.dateEndSession)) ? 'automation' : 'recording' : 'normal'
    }

    const key = crypto.createCipher('aes-128-cbc', config.SALT)

    let ciphertext = key.update(JSON.stringify(info), 'utf8', 'hex')
    ciphertext += key.final('hex')

    const url = `${config.PROTOCOL}://${config.HOST_COMMAND_URL}:${config.HOST_COMMAND_PORT}/?info=${ciphertext}`
    window.open(url, '_blank')


    // //>>>
    // if (info.executionType === 'automation') {
    //   const t_url = `${config.PROTOCOL}://${config.AUTOMATION_URL}:${config.AUTOMATION_PORT}/?id=${info.gameId}&host_url=${url}`
    //   const testingPageWindow = window.open(t_url, '_blank')
    //   setTimeout(() => testingPageWindow.close(),10000)
    // } else {
    //   window.open(url, '_blank')
    // }
*/
  }

  handleAccessGameApp(gameId) {
    window.open(
      `${config.PROTOCOL}://${config.GAME_APP_URL}:${config.GAME_APP_PORT}?gameId=${gameId}&stage=${this.props.GameEventStore.values.stage}&isLeap=${this.props.GameEventStore.leap.isLeap}`,
      '_blank'
    )
  }

  handleLeapTypeChange(e) {
    const el = document.getElementById('detail-editing-leap-button')
    if (el) {
      if (e.target.value) {
        el.disabled = true
        el.checked = true
        this.props.GameEventStore.leap.isLeap = true
      } else {
        el.disabled = false
      }

      this.props.GameEventStore.leap.leapType = e.target.value || ''
      this.props.GameEventStore.updateLeap().then(next => {
        if (next) {
          if ('automate' === this.props.GameEventStore.leap.leapType) {
            this.props.GameEventStore.getRecordedGames()
          }
        }
      })
    }
  }

  handleLeapChange(e) {
    const el = document.getElementById('detail-editing-leap-button')
    if (el) {
      this.props.GameEventStore.leap.isLeap = el.checked
      this.props.GameEventStore.updateLeap()
    }
  }

  handleImportPlaystackClick() {
    if (this.props.importPlaystack) {
      this.props.importPlaystack()
    }
  }

  handleMouseOver() {
    if (this.refContainer && this.refHoverWrapper) {
      if (this.refContainer.scrollHeight > this.refContainer.offsetHeight) {
        this.refContainer.style.overflowY = 'scroll'
        this.refHoverWrapper.style.width = vwToPx(28)
      } else {
        this.refContainer.style.overflowY = 'hidden'
        this.refHoverWrapper.style.width = '100%'
      }
    }
  }

  handleMouseOut() {
    if (this.refContainer && this.refHoverWrapper) {
      this.refContainer.style.overflowY = 'hidden'
      this.refHoverWrapper.style.width = '100%'
    }
  }

  componentDidMount() {
    // const today = new Date('2020-02-18')
    // const month = today.getMonth() + 1
    // const year = today.getFullYear()
    // const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // let daysInMonth = new Date(year, month, 0)
    /////////////////////////////////////////////this.toggleScrolling()

    //console.log('CONVERT TIMEZONE', moment(this.props.GameEventStore.values.dateStart).tz('America/Los_Angeles').format('M/D/yyyy HH:mm')   )
    //console.log('CONVERT TIMEZONE', moment(new Date()).tz('America/Los_Angeles').format('M/D/yyyy HH:mm')   )
    //console.log('CONVERT TIMEZONE', moment(this.props.GameEventStore.values.dateStart).tz('Asia/Singapore').format('M/D/yyyy HH:mm')   )

    const el = document.getElementById('detail-editing-leap-button')
    if (el) {
      el.checked = this.props.GameEventStore.leap.isLeap
    }
  }

  render() {
    let {
      values,
      startTimes,
      baseHeight,
      sportTypes,
      leap,
      isLoading,
    } = this.props.GameEventStore

    const zoneAbbr = moment.tz().zoneAbbr()
    const StackStartTime = null

    let sportTypeIcon = null
    try {
      sportTypeIcon = evalImage(
        sportTypes.filter(o => o.code === values.sportType.code)[0].icon[0]
      )
    } catch (err) {
      sportTypeIcon = null
    }

    const announceDateHasLapsed = new Date() > new Date(values.dateAnnounce)
    const prePicksDateHasLapsed = new Date() > new Date(values.datePrePicks)
    const isAccessHComm = this.props.OperatorStore.operator.access.hostCommand
    const hcommButtonText =
      values.stage === 'live'
        ? 'join h-comm'
        : values.leapType === 'recording'
        ? values.dateEndSession
          ? 'automate h-comm'
          : 'record h-comm'
        : 'access h-comm'

    return (
      <Container
        innerRef={ref => (this.refContainer = ref)}
        isScrolling={this.scrolling}
        onMouseOver={this.handleMouseOver.bind(this)}
        onMouseOut={this.handleMouseOut.bind(this)}
      >
        <Wrapper innerRef={ref => (this.refHoverWrapper = ref)}>
          <Content paddingLeft="3" paddingRight="3">
            {/*
            <Section direction="row" marginTop="2">
              <DDLeap value={leap.leapType} onChange={this.handleLeapTypeChange.bind(this)}>
                <option value="">none</option>
                <option value="record">record</option>
                <option value="automate">automate</option>
              </DDLeap>
              <LeapWrap>
                <LeapLabel>leap</LeapLabel>
                <input type="checkbox" style={{width:vhToPx(2.5), height:vhToPx(2.5), marginLeft:vhToPx(1), marginBottom:vhToPx(0.5)}} checked={leap && leap.isLeap ? leap.isLeap : false} onChange={this.handleLeapChange.bind(this)} id="detail-editing-leap-button"/>
              </LeapWrap>
            </Section>
            {
              leap.leapType && leap.leapType === 'automate' ?
                isLoading ? (
                <Section direction="row" alignItems="center">
                  <ActivityIndicator />
                  <Label font="pamainlight" size="2" uppercase>loading recorded games...</Label>
                </Section>
                ) : (
                <Section marginTop="1" style={{marginLeft:'1%'}}>
                  <DropdownRecordedGame height={this.props.GameEventStore.baseHeight} item={[]} />
                </Section>
              ) : null
            }
*/}
            <Section marginTop={2} justifyContent="space-between">
              <AccessButtonWrap>
                <AccessHComButton
                  text={hcommButtonText}
                  color={isAccessHComm ? '#ffffff' : '#8f8f8f'}
                  backgroundColor={
                    isAccessHComm
                      ? values.stage === 'live'
                        ? '#c61818'
                        : '#18c5ff'
                      : '#a8a8a8'
                  }
                  onClick={
                    isAccessHComm ? this.handleAccessHComm.bind(this) : null
                  }
                  cursor={isAccessHComm ? 'pointer' : 'default'}
                />
                <AccessHComButton
                  text={'access game-app'}
                  backgroundColor={'#c61818'}
                  onClick={this.handleAccessGameApp.bind(this, values.gameId)}
                />
              </AccessButtonWrap>
              {'recording' === values.leapType ? null : (
                <LeapWrap>
                  <LeapLabel>leap</LeapLabel>
                  <input
                    type="checkbox"
                    style={{
                      width: vhToPx(2.5),
                      height: vhToPx(2.5),
                      marginLeft: vhToPx(1),
                      marginBottom: vhToPx(0.5),
                    }}
                    checked={leap && leap.isLeap ? leap.isLeap : false}
                    onChange={this.handleLeapChange.bind(this)}
                    id="detail-editing-leap-button"
                  />
                </LeapWrap>
              )}
            </Section>
            {/*
            <Section marginTop={0.5}>
              {values.playCount ? null : (
                <AccessHComButton
                  text={'import playstack'}
                  backgroundColor={'#3F50B5'}
                  onClick={this.handleImportPlaystackClick.bind(this)}
                />
              )}
            </Section>
*/}
            <Section marginTop={2} justifyContent="space-between">
              <StageWrap>
                <Label
                  style={{ display: 'flex', alignSelf: 'flex-end' }}
                  font={'pamainlight'}
                  size={3.7}
                  color={'#939598'}
                  uppercase
                  nospacing
                >
                  stage:
                </Label>
                <Stage
                  text={`${'recording' === values.leapType ? 'record - ' : ''}${
                    stageColors[values.stage].text
                  }`}
                  color={stageColors[values.stage].color}
                  subText={stageColors[values.stage].subText}
                  subColor={stageColors[values.stage].subColor}
                />
              </StageWrap>
              {/*
              <AccessHComButton
                text={values.stage === 'live' ? 'join h-comm' : 'h-comm'}
                backgroundColor={values.stage === 'live' ? '#c61818' : '#18c5ff'}
                onClick={this.handleAccessHComm.bind(this)}
              />
              <AccessHComButton
                text={'game-app'}
                backgroundColor={'#c61818'}
                onClick={this.handleAccessGameApp.bind(this)}
              />
*/}
            </Section>
            <Section marginTop={2}>
              <Label
                font={'pamainregular'}
                size={2.4}
                color={'#000000'}
                uppercase
              >
                {values.gameId}
              </Label>
            </Section>
            <Section marginTop={1}>
              <ThisImage src={sportTypeIcon} imageSize={65} />
              <Label
                font={'pamainregular'}
                size={2.8}
                color={'#000000'}
                uppercase
                nowrap
              >
                &nbsp;{values.subSportGenre.name},&nbsp;
              </Label>
              <Label
                font={'pamainregular'}
                size={2.8}
                color={'#000000'}
                uppercase
                nowrap
              >
                {values.sportType.name}
              </Label>
            </Section>
            <Section marginTop={0.5}>
              <TeamSection>
                <TeamIconWrap>
                  <TeamIcon
                    teamInfo={values.participants[0]}
                    size={3}
                    outsideBorderColor={'#ffffff'}
                    outsideBorderWidth={0.2}
                  />
                  &nbsp;
                  <Label
                    font={'pamainlight'}
                    size={3}
                    marginBottom={3}
                    color={'#000000'}
                    uppercase
                    nospacing
                  >
                    {values.participants[0].name}
                  </Label>
                </TeamIconWrap>
                <TeamVS>
                  <Label font={'pamainextrabold'} size={2} uppercase>
                    &nbsp;&nbsp;vs&nbsp;&nbsp;
                  </Label>
                </TeamVS>
                <TeamIconWrap>
                  <TeamIcon
                    teamInfo={values.participants[1]}
                    size={3}
                    outsideBorderColor={'#ffffff'}
                    outsideBorderWidth={0.2}
                  />
                  &nbsp;
                  <Label
                    font={'pamainlight'}
                    size={3}
                    marginBottom={3}
                    color={'#000000'}
                    uppercase
                    nospacing
                  >
                    {values.participants[1].name}
                  </Label>
                </TeamIconWrap>
              </TeamSection>
            </Section>
            <Section marginTop={1}>
              <EditingSection>
                <Column>
                  {values.venue &&
                  values.venue.city &&
                  values.venue.city.name ? (
                    <Label font={'pamainregular'} size={2} uppercase nowrap>
                      {values.venue.city.name},&nbsp;
                    </Label>
                  ) : null}
                  {values.venue &&
                  values.venue.state &&
                  values.venue.state.name ? (
                    <Label font={'pamainregular'} size={2} uppercase nowrap>
                      {values.venue.state.name}&nbsp;-&nbsp;
                    </Label>
                  ) : null}
                  <Label font={'pamainregular'} size={2} uppercase nowrap>
                    {values.venue.stadiumName || ''}
                  </Label>
                </Column>
                {values.stage !== 'live' ? (
                  <EditButton
                    key="editingbutton-venue"
                    id="editing-venue-button"
                    onClick={this.handleEdit.bind(this, 'venue')}
                  />
                ) : null}
              </EditingSection>
            </Section>
            <Section marginTop={1}>
              <DateAndTimeWrap>
                <EditingSection>
                  <DateAndTimeStartJustify
                    widthInPct={this.timeStartEditing ? 100 : 75}
                  >
                    <DateStart
                      color={values.stage === 'live' ? '#c61818' : '#000000'}
                    >
                      {dateFormat(values.dateStart, 'mmmm dd, yyyy')}
                    </DateStart>
                    {this.timeStartEditing ? (
                      <DDStartTime
                        value={values.timeStart}
                        onChange={this.handleTimeChange.bind(this)}
                      >
                        {startTimes.map((time, idx) => (
                          <option key={`${idx}-${time}`} value={time}>
                            {time}
                          </option>
                        ))}
                      </DDStartTime>
                    ) : (
                      <TimeStart
                        color={values.stage === 'live' ? '#c61818' : '#000000'}
                      >
                        {values.timeStart}
                      </TimeStart>
                    )}
                  </DateAndTimeStartJustify>
                  {values.stage === 'live' ? (
                    <Label
                      font={'pamainextrabold'}
                      size={2}
                      color={'#c61818'}
                      uppercase
                    >
                      live
                    </Label>
                  ) : (
                    <EditButton
                      key="editingbutton-start-date"
                      id="editing-dateStart-button"
                      onClick={this.handleEdit.bind(this, 'timeStart')}
                    />
                  )}
                </EditingSection>
                <EditingSection>
                  {values.stage === 'public' ||
                  values.stage === 'pregame' ||
                  values.stage === 'pending' ||
                  values.stage === 'live' ||
                  announceDateHasLapsed ? (
                    <EditingSectionStack
                      blurred={values.stage === 'live' ? true : false}
                    >
                      <Column>
                        <DateAndTime
                          color={'#c61818'}
                          label={'announce date'}
                          date={dateFormat(
                            values.dateAnnounce,
                            'mmm. dd, yyyy'
                          )}
                        />
                      </Column>
                      <Label
                        font={'pamainextrabold'}
                        size={2}
                        color={'#c61818'}
                        uppercase
                      >
                        live
                      </Label>
                    </EditingSectionStack>
                  ) : (
                    <EditingSectionStack>
                      <Column>
                        <DateAndTime
                          color={'#18c5ff'}
                          label={'announce date'}
                          date={dateFormat(
                            values.dateAnnounce,
                            'mmm. dd, yyyy'
                          )}
                        />
                        <DateAndTimeRemaining
                          key="remaining-dateAnnounce"
                          date={values.dateAnnounce}
                        />
                      </Column>
                      <EditButton
                        key="editingbutton-announce-date"
                        id="editing-dateAnnounce-button"
                        onClick={this.handleEdit.bind(this, 'dateAnnounce')}
                      />
                    </EditingSectionStack>
                  )}
                </EditingSection>
                <EditingSection>
                  {values.stage === 'pregame' ||
                  values.stage === 'pending' ||
                  values.stage === 'live' ||
                  prePicksDateHasLapsed ? (
                    <EditingSectionStack
                      blurred={values.stage === 'live' ? true : false}
                    >
                      <Column>
                        <DateAndTime
                          color={'#c61818'}
                          label={'pre-pick date'}
                          date={dateFormat(
                            values.datePrePicks,
                            'mmm. dd, yyyy'
                          )}
                        />
                      </Column>
                      <Label
                        font={'pamainextrabold'}
                        size={2}
                        color={'#c61818'}
                        uppercase
                      >
                        live
                      </Label>
                    </EditingSectionStack>
                  ) : (
                    <EditingSectionStack>
                      <Column>
                        <DateAndTime
                          color={'#0fbc1c'}
                          label={'pre-pick date'}
                          date={dateFormat(
                            values.datePrePicks,
                            'mmm. dd, yyyy'
                          )}
                        />
                        <DateAndTimeRemaining
                          key="remaining-ppdate"
                          date={values.datePrePicks}
                        />
                      </Column>
                      <EditButton
                        key="editingbutton-prepicks-date"
                        id="editing-datePrePicks-button"
                        onClick={this.handleEdit.bind(this, 'datePrePicks')}
                      />
                    </EditingSectionStack>
                  )}
                </EditingSection>
              </DateAndTimeWrap>
            </Section>
            <Section marginTop="0.6">
              <OperatorsWrap>
                <div
                  id="editing-operators-section"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <OperatorsHeader />
                  <EditButton
                    key="editingbutton-operators"
                    id="editing-operators-button"
                    onClick={this.handleEdit.bind(this, 'operators')}
                  />
                </div>

                <EditingArea id="editing-operators-area">
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingLeft: vhToPx(1),
                      marginBottom: vhToPx(0.5),
                    }}
                  >
                    <OperatorsHeader
                      onClick={this.handleEdit.bind(this, 'operators')}
                    />
                    <EditButton
                      key="editingbutton-operators-modal"
                      backgroundColor="#ffffff"
                      onClick={this.handleEdit.bind(this, 'operators')}
                    />
                  </div>
                  <Operators
                    height={baseHeight}
                    operators={values.operators}
                    pushOperator={this.handlePushOperator.bind(this)}
                    removeOperator={this.handleRemoveOperator.bind(this)}
                  />
                </EditingArea>
              </OperatorsWrap>
            </Section>

            {/*
          <MyButton innerRef={ref => this.refContainer = ref}>
            <Butt
                 onClick={this.handleEdit.bind(this)}
                 innerRef={ref => this.refButton = ref}
                 id="target"
            ></Butt>

            <Mod innerRef={ref => this.refMod = ref}>XXX</Mod>

            <div style={{width: '50%', position:'absolute'}} ref={ref => this.refMod = ref}>
              <EditingCalendar />
            </div>
          </MyButton>
*/}
          </Content>

          <Content widthInPct="96" heightInPct="100" marginTop="1">
            {values.stage === 'live' ? (
              <StatsWrapper>
                <StatsContent
                  backgroundColor="#ffffff"
                  paddingLeft="3"
                  paddingRight="3"
                >
                  <Section marginTop="2" justifyContent="space-between">
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      active participation
                    </Label>
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      total connected
                    </Label>
                  </Section>
                  <Section marginTop="0.5" justifyContent="space-between">
                    <Label
                      font={'pamainlight'}
                      size={4.2}
                      color={'#000000'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      1,250
                    </Label>
                    <Label
                      font={'pamainbold'}
                      size={4.2}
                      color={'#000000'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      2,100
                    </Label>
                  </Section>

                  <Section marginTop="2.5" justifyContent="space-between">
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      win/loss ratio
                    </Label>
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      average tokens spent
                    </Label>
                  </Section>
                  <Section marginTop="0.5" justifyContent="space-between">
                    <RatioWrap>
                      <Label
                        font={'pamainlight'}
                        size={4.2}
                        color={'#18c5ff'}
                        uppercase
                        nowrap
                        nospacing
                      >
                        32
                      </Label>
                      <Label
                        font={'pamainextrabold'}
                        size={4.2}
                        color={'#808285'}
                        uppercase
                        nowrap
                        nospacing
                      >
                        &nbsp;:&nbsp;
                      </Label>
                      <Label
                        font={'pamainlight'}
                        size={4.2}
                        color={'#c61818'}
                        uppercase
                        nowrap
                        nospacing
                      >
                        68
                      </Label>
                    </RatioWrap>
                    <Label
                      font={'pamainbold'}
                      size={4.3}
                      color={'#E59200'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      4
                    </Label>
                  </Section>

                  <Section marginTop="2" justifyContent="space-between">
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      panels served
                    </Label>
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      panels viewed
                    </Label>
                  </Section>
                  <Section marginTop="0.5" justifyContent="space-between">
                    <Label
                      font={'pamainlight'}
                      size={4.2}
                      color={'#000000'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      89
                    </Label>
                    <Label
                      font={'pamainbold'}
                      size={4.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      89,100
                    </Label>
                  </Section>

                  <Section marginTop="2.5" justifyContent="space-between">
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      win/loss stars ratio
                    </Label>
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      stars served
                    </Label>
                  </Section>
                  <Section
                    marginTop="0.5"
                    marginBottom="1.5"
                    justifyContent="space-between"
                  >
                    <RatioWrap>
                      <Label
                        font={'pamainlight'}
                        size={4.2}
                        color={'#CCB300'}
                        uppercase
                        nowrap
                        nospacing
                      >
                        5
                      </Label>
                      <Label
                        font={'pamainextrabold'}
                        size={4.2}
                        color={'#808285'}
                        uppercase
                        nowrap
                        nospacing
                      >
                        &nbsp;:&nbsp;
                      </Label>
                      <Label
                        font={'pamainlight'}
                        size={4.2}
                        color={'#c61818'}
                        uppercase
                        nowrap
                        nospacing
                      >
                        20
                      </Label>
                    </RatioWrap>
                    <Label
                      font={'pamainbold'}
                      size={4.3}
                      color={'#CCB300'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      8
                    </Label>
                  </Section>
                </StatsContent>
                <StatsContent
                  backgroundColor="#414042"
                  paddingLeft="3"
                  paddingRight="3"
                  height="23.6"
                >
                  <Section
                    marginTop="1.5"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#ffffff'}
                      uppercase
                      nowrap
                    >
                      participated pre-picks
                    </Label>
                    <Label
                      font={'pamainlight'}
                      size={4.2}
                      color={'#ffffff'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      18,000
                    </Label>
                  </Section>

                  <Section
                    marginTop="2"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#ffffff'}
                      uppercase
                      nowrap
                    >
                      event viewed by unique users
                    </Label>
                    <Label
                      font={'pamainbold'}
                      size={4.3}
                      color={'#ffffff'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      100
                    </Label>
                  </Section>

                  <Section marginTop="2" direction="column">
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#ffffff'}
                      uppercase
                      nowrap
                    >
                      users to be notified through
                    </Label>
                    <NotificationWrap>
                      <NotifiedThrough
                        text={50}
                        color="#ffffff"
                        font="pamainbold"
                      >
                        <NotifiedIcon
                          src={EmailIcon}
                          height={2.7}
                          marginLeft="0.5"
                          marginRight="5"
                        />
                      </NotifiedThrough>
                      <NotifiedThrough
                        text={50}
                        color="#ffffff"
                        font="pamainbold"
                      >
                        <NotifiedIcon
                          src={SMSIcon}
                          height={3.5}
                          marginLeft="0"
                          marginRight="5"
                        />
                      </NotifiedThrough>
                      <NotifiedThrough
                        text={50}
                        color="#ffffff"
                        font="pamainbold"
                      >
                        <NotifiedIcon
                          src={AppIcon}
                          height={3.3}
                          marginLeft="0.5"
                        />
                      </NotifiedThrough>
                    </NotificationWrap>
                  </Section>

                  <Section marginBottom="1.5"></Section>
                </StatsContent>
              </StatsWrapper>
            ) : values.stage === 'public' ||
              values.stage === 'pregame' ||
              values.stage === 'pending' ? (
              <StatsWrapper backgroundColor="#ffffff" heightInPct="100">
                <StatsContent paddingLeft="3" paddingRight="3">
                  {values.stage === 'pregame' || values.stage === 'pending' ? (
                    <Section
                      marginTop="2"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Label
                        font={'pamainregular'}
                        size={2.3}
                        color={'#22ba2c'}
                        uppercase
                        nowrap
                      >
                        participated pre-picks
                      </Label>
                      <Label
                        font={'pamainlight'}
                        size={4.2}
                        color={'#22ba2c'}
                        uppercase
                        nowrap
                        nospacing
                      >
                        18,000
                      </Label>
                    </Section>
                  ) : null}

                  <Section
                    marginTop="3"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      event viewed by unique users
                    </Label>
                    <Label
                      font={'pamainbold'}
                      size={4.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                      nospacing
                    >
                      100
                    </Label>
                  </Section>

                  <Section marginTop="2" direction="column">
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      users to be notified through
                    </Label>
                    <NotificationWrap>
                      <NotifiedThrough text={50} font="pamainbold">
                        <NotifiedIcon
                          src={EmailIcon}
                          height={2.7}
                          marginLeft="0.5"
                          marginRight="5"
                        />
                      </NotifiedThrough>
                      <NotifiedThrough text={50} font="pamainbold">
                        <NotifiedIcon
                          src={SMSIcon}
                          height={3.5}
                          marginLeft="0"
                          marginRight="5"
                        />
                      </NotifiedThrough>
                      <NotifiedThrough text={50} font="pamainbold">
                        <NotifiedIcon
                          src={AppIcon}
                          height={3.3}
                          marginLeft="0.5"
                        />
                      </NotifiedThrough>
                    </NotificationWrap>
                  </Section>

                  <Section marginTop="2" direction="column">
                    <Label
                      font={'pamainregular'}
                      size={2.3}
                      color={'#000000'}
                      uppercase
                      nowrap
                    >
                      shared on social platforms
                    </Label>
                    <NotificationWrap>
                      <NotifiedThrough text={50} font="pamainlight">
                        <NotifiedIcon
                          src={EmailIcon}
                          height={2.7}
                          marginLeft="0.5"
                          marginRight="5"
                        />
                      </NotifiedThrough>
                      <NotifiedThrough text={50} font="pamainlight">
                        <NotifiedIcon
                          src={SMSIcon}
                          height={3.5}
                          marginLeft="0"
                          marginRight="5"
                        />
                      </NotifiedThrough>
                      <NotifiedThrough text={50} font="pamainlight">
                        <NotifiedIcon
                          src={AppIcon}
                          height={3.3}
                          marginLeft="0.5"
                          marginRight="5"
                        />
                      </NotifiedThrough>
                      <NotifiedThrough text={50} font="pamainlight">
                        <NotifiedIcon
                          src={AppIcon}
                          height={3.3}
                          marginLeft="0.5"
                        />
                      </NotifiedThrough>
                    </NotificationWrap>
                  </Section>

                  <Section marginTop={10} justifyContent="center">
                    <Label
                      font={'pamainregular'}
                      size={4.5}
                      color={'#c61818'}
                      uppercase
                      nowrap
                    >
                      event starts in:
                    </Label>
                  </Section>
                  <Section marginTop={0.5} justifyContent="center">
                    <DateAndTimeRemaining
                      key="remaining-dateStart"
                      date={values.dateStart + ' ' + values.timeStart}
                      pos="center"
                      size="4.5"
                    />
                  </Section>
                  {values.stage === 'pregame' || values.stage === 'pending' ? (
                    <Section marginTop={4} justifyContent="center">
                      <Label
                        font={'pamainregular'}
                        size={2.3}
                        color={'#939598'}
                        uppercase
                        nowrap
                      >
                        event stats to be loaded during live
                      </Label>
                    </Section>
                  ) : null}
                </StatsContent>
              </StatsWrapper>
            ) : (
              <StatsWrapper heightInPct="100">
                <StatsContent>
                  <Section marginTop={30} justifyContent="center">
                    <Label
                      font={'pamainregular'}
                      size={4.5}
                      color={'#c61818'}
                      uppercase
                      nowrap
                    >
                      event starts in:
                    </Label>
                  </Section>
                  <Section marginTop={0.5} justifyContent="center">
                    <DateAndTimeRemaining
                      key="remaining-dateStart"
                      date={values.dateStart + ' ' + values.timeStart}
                      pos="center"
                      size="4.5"
                    />
                  </Section>
                </StatsContent>
              </StatsWrapper>
            )}
          </Content>
        </Wrapper>
        {this.modal}
      </Container>
    )
  }
}
const ContentBG = 'public, pregame, pending, live'
let h = 0
const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 200;

  overflow-x: hidden;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;

  -ms-overflow-style: -ms-autohiding-scrollbar;
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 ${props => vhToPx(0)} rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar {
    width: ${props => vhToPx(0)};
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    -webkit-box-shadow: inset 0 0 ${props => vhToPx(1)} rgba(0, 0, 0, 0.3);
    background-color: rgba(85, 85, 85, 0.5);
    &:hover {
      background-color: #555;
    }
  }

  &:hover::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 ${props => vhToPx(1)} rgba(0, 0, 0, 0.3);
  }

  &:hover::-webkit-scrollbar {
    width: ${props => vhToPx(1)};
  }
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Modal = styled.div`
  position: absolute;
  width: 95%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  animation: ${props => fadeIn} 0.1s forwards;
  z-index: 10;
`

const fadeIn = keyframes`
  0%{opacity: 0;}
  100%{opacity: 1;}
`

const MyButton = styled.div`
  width: 100%;
  height: 90vh;
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  /*position: element() constrain-to-window;*/
  z-index: 1000;
  position: relative;
`

const Butt = styled.div`
  width: 4vh;
  height: 4vh;
  background: blue;
  margin-left: 30vh;
  cursor: pointer;
  margin-top: 20vh;
  display: flex;
  position: absolute;
`

const Mod = styled.div`

  width: 11vh;
  height: 11vh;
  background:rgba(255,0,0,0.3);
  display: flex;
  /*position: element(${props => props.reference}) ;*/
  position: absolute;

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

const StageWrap = styled.div`
  display: flex;
  flex-direction: row;
`

const Stage = styled.div`
  display: flex;
  flex-direction: row;
  &:before {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(4)};
    height: ${props => vhToPx(4 * 0.8)};
    line-height: 1;
    color: ${props => props.color};
    transform: scaleY(1.3);
    transform-origin: bottom;
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
    align-self: flex-end;
    margin-left: ${props => vhToPx(1)};
  }
  &:after {
    content: '${props => props.subText}';
    font-family: pamainregular;
    font-size: ${props => vhToPx(1.5)};
    height: ${props => vhToPx(1.5 * 0.8)};
    line-height: 1;
    color: ${props => props.subColor};
    transform: scaleY(1.3);
    transform-origin: bottom;
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
    align-self: flex-end;
    margin-left: ${props => vhToPx(1)};
  }
`

const AccessButtonWrap = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  display: flex;
  flex-direction: row;
`

const AccessHComButton = styled.div`
  width: ${props => props.widthInPct || 42}%;
  height: ${props => vhToPx(h)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => props.cursor || 'pointer'};
  margin-left: 1%;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.4)};
    color: ${props => props.color || '#ffffff'};
    height: ${props => vhToPx(h * 0.4 * 0.8)};
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
    white-space: nowrap;
  }
`

const ThisImage = styled.div`
  width: ${props => vhToPx(3)};
  height: ${props => vhToPx(3)};
  min-width: ${props => vhToPx(3)};
  min-height: ${props => vhToPx(3)};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000000;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: ${props => props.imageSize || 65}%;
    background-position: center;
  }
`

const TeamSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TeamIconWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TeamVS = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 2%;
`

const DateAndTimeWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const DateAndTimeStartJustify = styled.div`
  width: ${props => props.widthInPct || 75}%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const DateStart = styled.div`
  font-family: pamainregular;
  font-size: ${props => vhToPx(3.2)};
  text-transform: uppercase;
  color: ${props => props.color};
  line-height: 1;
  height: ${props => vhToPx(3.2 * 0.8)};
  margin-right: ${props => vwToPx(1.5)};
  margin-bottom: 0.5%;
  white-space: nowrap;
`

const TimeStart = styled.div`
  font-family: pamainlight;
  font-size: ${props => vhToPx(4.5)};
  text-transform: uppercase;
  color: ${props => props.color};
  line-height: 1;
  height: ${props => vhToPx(4.5 * 0.8)};
  white-space: nowrap;
`

const DateAndTime = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:before {
    content: '${props => props.label}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(2.3)};
    text-transform: uppercase;
    color: ${props => props.color || '#ffffff'};
    line-height: 1;
    height: ${props => vhToPx(2.3 * 0.8)};
    margin-bottom: 0.5%;
    display: flex;
    justify-content: flex-start;
  }
  &:after {
    content: '${props => props.date}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(2.3)};
    text-transform: uppercase;
    color: ${props => props.color || '#ffffff'};
    line-height: 1;
    height: ${props => vhToPx(2.3 * 0.8)};
    margin-bottom: 0.5%;
    display: flex;
    justify-content: flex-end;
  }
`

const EditingSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  //padding: ${props => vhToPx(0.3)} 0;
  margin: ${props => vhToPx(0.5)} 0;
`

const EditingSectionStack = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  opacity: ${props => (props.blurred ? 0.2 : 1)};
`

const EditButton = styled.div`
  width: ${props => vhToPx(5 * 0.75)};
  height: ${props => vhToPx(5 * 0.75)};
  min-width: ${props => vhToPx(5 * 0.75)};
  min-height: ${props => vhToPx(5 * 0.75)};
  background-color: ${props => props.backgroundColor || '#000000'};
  background-image: url(${EditIcon});
  background-repeat: no-repeat;
  background-size: 55%;
  background-position: center;
  cursor: pointer;
`

const Column = styled.div`
  width: 75%;
`

const OperatorsWrap = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
`

const OperatorsHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  &:before {
    content: '';
    display: inline-block;
    width: ${props => vhToPx(3)};
    height: ${props => vhToPx(3)};
    min-width: ${props => vhToPx(3)};
    min-height: ${props => vhToPx(3)};
    border-radius: 50%;
    background-color: #000000;
    background-image: url(${OperatorsIcon});
    background-repeat: no-repeat;
    background-size: 50%;
    background-position: center;
  }
  &:after {
    content: 'event operators';
    font-family: pamainregular;
    font-size: ${props => vhToPx(2.8)};
    color: #000000;
    line-height: 1;
    height: ${props => vhToPx(2.8 * 0.8)};
    text-transform: uppercase;
    margin-bottom: 1%;
    margin-left: ${props => vhToPx(1)};
  }
`

const EditingArea = styled.div`
  width: 100%;
  height: ${props => vhToPx(5 * 0.75)};
  opacity: 0;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  z-index: 0;
`

const AddUserRolesButton = styled.div`
  width: 100%;
  height: ${props => vhToPx(props.height)};
  background-color: #a7a9ac;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  margin-top: ${props => vhToPx(0.5)};
  &:before {
    content: '+';
    font-family: pamainregular;
    font-size: ${props => vhToPx(props.height * 0.5)};
    color: #eaeaea;
    line-height: 1;
    margin-top: 0.2%;
  }
  &:after {
    content: 'ADD USERS & ROLES';
    font-family: pamainbold;
    font-size: ${props => vhToPx(props.height * 0.4)};
    color: #eaeaea;
    line-height: 1;
    margin-top: 0.3%;
  }
`

const CalendarWrap = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding-left: ${props => vhToPx(3)};
`

const CalendarWidth = styled.div`
  width: 80%;
  display: flex;
`

const StatsWrapper = styled.div`
  width: 100%;
  height: ${props => (props.heightInPct ? `${props.heightInPct}%` : 'auto')};
  display: flex;
  flex-direction: column;
  background-color: ${props => props.backgroundColor};
`

const StatsContent = styled.div`
  width: 100%;
  height: ${props => (props.height ? `${props.height}%` : 'auto')};
  ${props => (props.height ? `min-height:${vhToPx(props.height)}` : '')};
  background-color: ${props => props.backgroundColor};
  padding-left: ${props => vhToPx(props.paddingLeft) || 0};
  padding-right: ${props => vhToPx(props.paddingRight) || 0};
`

const RatioWrap = styled.div`
  display: flex;
  flex-direction: row;
`

const NotificationWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: ${props => vhToPx(0.5)};
`

const NotifiedThrough = styled.div`
  height: ${props => vhToPx(4)};
  display: flex;
  align-items: center;
  &:before {
    content: '${props => props.text}';
    font-family: ${props => props.font || 'pamainbold'};
    font-size: ${props => vhToPx(4.3)};
    color: ${props => props.color || '#000000'};
    line-height: 1;
  }
`

const NotifiedIcon = styled.img`
  height: ${props => vhToPx(props.height)};
  margin-left: ${props => vhToPx(props.marginLeft || 0)};
  margin-right: ${props => vhToPx(props.marginRight || 0)};
`

class DateAndTimeRemaining extends Component {
  constructor(props) {
    super(props)

    this.start = moment(new Date())
    this.end = moment(new Date(this.props.date) || new Date())
    this.days = this.end.diff(this.start, 'days') || 0
    this.hours =
      this.end.subtract(this.days, 'days').diff(this.start, 'hours') || 0
    this.mins =
      this.end.subtract(this.hours, 'hours').diff(this.start, 'minutes') || 0
    this.secs =
      this.end.subtract(this.mins, 'minutes').diff(this.start, 'seconds') || 0
    this.check = null
  }

  componentWillUnmount() {
    clearInterval(this.check)
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.date !== nextProps.date) {
      this.start = moment(new Date())
      this.end = moment(new Date(nextProps.date) || new Date())
      this.days = this.end.diff(this.start, 'days') || 0
      this.hours =
        this.end.subtract(this.days, 'days').diff(this.start, 'hours') || 0
      this.mins =
        this.end.subtract(this.hours, 'hours').diff(this.start, 'minutes') || 0
      this.secs =
        this.end.subtract(this.mins, 'minutes').diff(this.start, 'seconds') || 0
      return true
    }
    return false
  }

  render() {
    let { pos, size } = this.props
    let { days, hours, mins, secs } = this

    return (
      <DTRContainer pos={pos}>
        <DTRWrapper>
          <DTRText text={days} label="days" size={size} />
          <DTRText text={hours} label="hr" size={size} />
          <DTRText text={mins} label="min" size={size} />
          <DTRText text={secs} label="s" size={size} />
        </DTRWrapper>
      </DTRContainer>
    )
  }
}

const DTRContainer = styled.div`
  display: flex;
  justify-content: ${props => props.pos || 'flex-end'};
`

const DTRWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const DTRText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: ${props => vhToPx(0.7)};
  &:before {
    content: '${props => props.text}';
    font-family: pamainextrabold;
    font-size: ${props => vhToPx(props.size || 2.3)};
    color: #000000;
    text-transform: uppercase;
    line-height: 0.9;
    height: ${props => vhToPx((props.size || 2.3) * 0.8)};
    align-self: flex-end;
  }
  &:after {
    content: '${props => props.label}';
    font-family: pamainlight;
    font-size: ${props => vhToPx(props.size || 2.3)};
    color: #939598;
    text-transform: uppercase;
    line-height: 0.9;
    height: ${props => vhToPx((props.size || 2.3) * 0.75)};
    align-self: flex-end;
  }
`

/*
const DateAndTimeStartRemaining = (props) => {
  return (
    <DTRContainer>
      <DTRWrapper>
        <DTRContent>
          <DateValue size={props.size}>14</DateValue>
          <DateLabel size={props.size}>days&nbsp;</DateLabel>
          <DateValue size={props.size}>12</DateValue>
          <DateLabel size={props.size}>hr&nbsp;</DateLabel>
          <DateValue size={props.size}>30</DateValue>
          <DateLabel size={props.size}>min&nbsp;</DateLabel>
          <DateValue size={props.size}>45</DateValue>
          <DateLabel size={props.size}>s</DateLabel>
        </DTRContent>
      </DTRWrapper>
    </DTRContainer>
  )
}

const DTRContent = styled.div`
  display: flex;
  flex-direction: row;
`

const DateValue = styled.span`
    font-family: pamainextrabold;
    font-size: ${props => vhToPx(props.size || 2.3)};
    color: #000000;
    text-transform: uppercase;
    line-height: 0.9;
    height: ${props => vhToPx((props.size || 2.3) * 0.8)};
`

const DateLabel = styled.span`
    font-family: pamainlight;
    font-size: ${props => vhToPx(props.size || 2.3)};
    color: #939598;
    text-transform: uppercase;
    line-height: 0.9;
    height: ${props => vhToPx((props.size || 2.3) * 0.75)};
    align-self: flex-end;
`
*/

const DDStartTime = styled.select`
  width: 100%;
  height: ${props => vhToPx(h * 0.8)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  margin-right: ${props => vhToPx(0.2)};
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.8 * 0.6)};
  line-height: 0.9;
  text-transform: uppercase;
  background-image: url(${props => UpArrowIcon});
  background-repeat: no-repeat;
  background-size: ${props => vhToPx(1.8)};
  background-position: bottom ${props => vhToPx(-0.5)} right;
  text-align: center;
  text-align-last: center;
`

const Content = styled.div`
  width: ${props => props.widthInPct || 100}%;
  ${props => (props.heightInPct ? `height:${props.heightInPct}%` : '')};
  background-color: ${props => props.backgroundColor || 'transparent'};
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  padding-left: ${props => vhToPx(props.paddingLeft) || 0};
  padding-right: ${props => vhToPx(props.paddingRight) || 0};
  display: flex;
  flex-direction: column;
`

const LeapWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  // width: 100%;
  // height: ${props => vhToPx(h)};
  // display: flex;
  // flex-direction: row;
`

const LeapLabel = styled.span`
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(3)};
  color: #000000;
  white-space: nowrap;
  text-transform: uppercase;
`

const ModalButtonWrap = styled.div`
  position: relative;
  width: 92%;
  display: flex;
  justify-content: flex-end;
`

const ModalButton = styled.div`
  width: 25%;
  height: ${props => vhToPx(5)};
  ${props =>
    props.backgroundColor ? `background-color:${props.backgroundColor}` : ``};
  ${props =>
    props.hasBorder ? `border:${vhToPx(0.4)} solid ${props.color}` : ``};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  ${props => (props.marginRight ? `margin-right:${vwToPx(0.5)}` : ``)};
  &:after {
    content: '${props => props.text}';
    font-family: pamainregular;
    font-size: ${props => vhToPx(2.5)};
    color: ${props => props.color};
    text-transform: uppercase;
    line-height: 1;
  }
`

const DDLeap = styled.select`
  width: 60%;
  height: ${props => vhToPx(h)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-size: ${props => vhToPx(2)};
  text-align-last: center;
  margin-right: ${props => vhToPx(0.2)};

  font-family: pamainextrabold;
  font-size: ${props => vhToPx(h * 0.5)};
  line-height: 1;
  text-transform: uppercase;
  margin: 0 6% 0 1%;
`
