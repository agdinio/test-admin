import React, { Component, forwardRef } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable, runInAction } from 'mobx'
import {
  vhToPx,
  vwToPx,
  isEqual,
  evalImage,
  vhToPxNum,
  dateTimeZone,
} from '@/utils'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import StartDateIcon from '@/assets/images/icon-calendar.svg'
//----------import AnnounceDateIcon from '@/assets/images/icon-announce-schedule.svg'
import StartTimeIcon from '@/assets/images/icon-time.svg'
import dateFormat from 'dateformat'
import differenceInCalendarDays from 'date-fns/esm/differenceInCalendarDays'
import subDays from 'date-fns/subDays'
import moment from 'moment-timezone'
import ParticipantItem from '@/Components/Events/GameDetail/ParticipantItem'
import Operators from '@/Components/Events/GameDetail/Operators'
import DatePicker from 'react-datepicker'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'
import '@/styles/sporttype-dropdown.css'
import DropdownRecordedGame from './DropdownRecordedGame'

@inject('GameEventStore', 'NavigationStore')
@observer
export default class DetailCreating extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      eventTypes: [],
      dates: {
        dateStart: this.props.GameEventStore.values.dateStart
          ? new Date(this.props.GameEventStore.values.dateStart)
          : new Date(dateTimeZone(new Date())),
        dateAnnounce: this.props.GameEventStore.values.dateAnnounce
          ? new Date(this.props.GameEventStore.values.dateAnnounce)
          : new Date(dateTimeZone(new Date())),
        datePrePicks: this.props.GameEventStore.values.datePrePicks
          ? new Date(this.props.GameEventStore.values.datePrePicks)
          : new Date(dateTimeZone(new Date())),
      },
      scrolling: false,
      ddCityBlocker: null,
      sportTypeNoHover: false,
    })

    this.selectedSportType = null
    this.selectedSubSportGenre = null
    this.videoFootageSelectedCityId = 0

    h = this.props.GameEventStore.baseHeight
    //this.props.GameEventStore.getSportTypes();
    //this.props.GameEventStore.getStates();

    /*
    if (sessionStorage.getItem('EVENT_VALUES')) {
      const gameEventValues = JSON.parse(sessionStorage.getItem('EVENT_VALUES'))
      this.selectedSportType = gameEventValues.sportType
      this.selectedSubSportGenre = gameEventValues.subSportGenre
    } else {
      if (this.props.GameEventStore.values.sportType && Object.keys(this.props.GameEventStore.values.sportType).length > 0) {
        this.selectedSportType = this.props.GameEventStore.values.sportType
      }
      if (this.props.GameEventStore.values.subSportGenre && Object.keys(this.props.GameEventStore.values.subSportGenre).length > 0) {
        this.handleEventTypeClick(this.props.GameEventStore.values.subSportGenre)
      }
    }
*/
    if (
      this.props.GameEventStore.values.sportType &&
      Object.keys(this.props.GameEventStore.values.sportType).length > 0
    ) {
      this.selectedSportType = this.props.GameEventStore.values.sportType
    }
    if (
      this.props.GameEventStore.values.subSportGenre &&
      Object.keys(this.props.GameEventStore.values.subSportGenre).length > 0
    ) {
      this.handleEventTypeClick(this.props.GameEventStore.values.subSportGenre)
    }
  }

  handleLeapChange(e) {
    const el = document.getElementById('detail-creating-leap-button')
    if (el) {
      this.props.GameEventStore.leap.isLeap = el.checked
      this.props.GameEventStore.values.isLeap = el.checked
    }
  }

  handleLeapTypeChange(e) {
    this.props.GameEventStore.leap.leapType = e.target.value || ''
    this.props.GameEventStore.values.leapType = e.target.value || ''

    const el = document.getElementById('detail-creating-leap-button')
    if (el) {
      if (e.target.value) {
        el.disabled = true
        el.checked = true
        this.props.GameEventStore.leap.isLeap = true
      } else {
        el.disabled = false
      }

      if ('automate' === e.target.value) {
        this.props.GameEventStore.getRecordedGames()
      } else if ('recording' === e.target.value) {
        this.props.GameEventStore.getVideoFootage()
      } else {
        this.props.GameEventStore.values.video = {}
        this.props.GameEventStore.leap.leapType = ''
        this.props.GameEventStore.leap.video = null
      }
    }
  }

  async handleVideoChange(e) {
    console.log(':::::::::', JSON.parse(e.target.value))

    const _videoInfo = JSON.parse(e.target.value)
    let _subSportGenre = null

    await this.props.GameEventStore.sportTypes.filter(s => {
      if (s.id === _videoInfo.sportTypeId) {
        this.selectedSportType = s
        if (s.eventTypes && Array.isArray(s.eventTypes)) {
          _subSportGenre = s.eventTypes.filter(
            ss => ss.code === _videoInfo.subSportGenre
          )[0]
        }
      }
    })[0]

    await this.props.GameEventStore.states.filter(async state => {
      if (state.code.toLowerCase() === _videoInfo.stateCode.toLowerCase()) {
        this.stateChange(JSON.stringify(state))
        this.videoFootageSelectedCityId = _videoInfo.cityId
      }
    })[0]

    if (_subSportGenre && Object.keys(_subSportGenre).length > 0) {
      this.handleEventTypeClick(_subSportGenre)
    }

    this.props.GameEventStore.leap.video = await _videoInfo
    this.props.GameEventStore.values.video = await _videoInfo
    this.props.GameEventStore.values.venue.stadiumName = _videoInfo.stadium
    this.props.GameEventStore.values.venue.countryCode = _videoInfo.countryCode

    if (_videoInfo.participants && Array.isArray(_videoInfo.participants)) {
      await _videoInfo.participants.forEach((participant, idx) => {
        participant.id = idx + 1
        participant.gameId = ''
        participant.score = 0
        participant.showBottomColorPicker = false
        participant.showTopColorPicker = false
      })
    }
    this.props.GameEventStore.values.participants = _videoInfo.participants
  }

  handleSelectedGame(selectedGame) {
    if (selectedGame) {
      this.props.GameEventStore.values.gameId = selectedGame.gameId
      this.props.NavigationStore.setCurrentView('/gamedetail_automate')
    }
  }

  handleSeasonChange(e) {
    this.props.GameEventStore.values.autofillGameId.dropdown = `-${e.target.value}`
  }

  handleGameIdChange(e) {
    this.props.GameEventStore.values.gameId = e.target.value
  }

  handleSportTypeClick(option) {
    this.props.GameEventStore.values.sportType = {
      name: option.name,
      code: option.code,
      icon: option.icon,
    }
    //////////////////////////////////////////////////////this.props.GameEventStore.values.eventType = ''
    this.props.GameEventStore.values.subSportGenre = {}
    this.props.GameEventStore.values.autofillGameId.sportType = option.code
    this.props.GameEventStore.values.autofillGameId.eventType = ''

    for (let i = 0; i < this.props.GameEventStore.sportTypes.length; i++) {
      const _sportType = this.props.GameEventStore.sportTypes[i]
      if (option.name === _sportType.name) {
        _sportType.selected = true
      } else {
        _sportType.selected = false
      }
    }

    const sportType = this.props.GameEventStore.sportTypes.filter(
      o => o.name === option.name
    )[0]
    if (sportType) {
      this.eventTypes = sportType.eventTypes
      for (let j = 0; j < this.eventTypes.length; j++) {
        this.eventTypes[j].selected = false
      }
    }
  }

  handleEventTypeClick(option) {
    this.selectedSubSportGenre = option

    this.props.GameEventStore.values.sportType = this.selectedSportType
    this.props.GameEventStore.values.subSportGenre = option

    this.props.GameEventStore.values.autofillGameId.sportType = this.selectedSportType.code
    this.props.GameEventStore.values.autofillGameId.eventType = option.code
    this.props.GameEventStore.values.autofillGameId.dropdown = this.refDDSeason
      ? '-' + this.refDDSeason.value
      : ''
    this.props.GameEventStore.values.autofillGameId.generated = '-' + seasonId()

    this.sportTypeNoHover = true
    setTimeout(() => (this.sportTypeNoHover = false), 500)

    console.log(
      'VALUES',
      JSON.parse(JSON.stringify(this.props.GameEventStore.values))
    )

    if (
      this.props.GameEventStore.values.sportType &&
      this.props.GameEventStore.values.sportType.id
    ) {
      this.props.GameEventStore.getSponsorsBySportType({
        sportTypeId: this.props.GameEventStore.values.sportType.id,
      })
    }
  }

  stateChange(option) {
    this.ddCityBlocker = (
      <DDCityBlocker>
        <ActivityIndicator height={h} />
      </DDCityBlocker>
    )
    this.props.GameEventStore.values.venue.state = JSON.parse(option)
    const stateCode = JSON.parse(option).code
    setTimeout(() => {
      this.props.GameEventStore.readCitiesByState(stateCode).then(
        async response => {
          this.ddCityBlocker = null
          if (this.videoFootageSelectedCityId) {
            const _city = await response.filter(
              o => o.cityId === this.videoFootageSelectedCityId
            )[0]
            if (_city) {
              this.props.GameEventStore.values.venue.city = _city
              if (this.refDDCity) {
                this.refDDCity.value = JSON.stringify(_city)
                this.refDDCity.dispatchEvent(new Event('change'))
              }
            }
          }
        }
      )
    }, 0)
  }

  handleStateChange(e) {
    this.stateChange(e.target.value)
  }

  handleCityChange(e) {
    this.props.GameEventStore.values.venue.city = JSON.parse(e.target.value)
  }

  handleStadiumNameChange(e) {
    this.props.GameEventStore.values.venue.stadiumName = e.target.value
  }

  handleTeamUpdated(val) {
    this.props.GameEventStore.setTeamUpdated(val)

    //AUTO FILL GAME ID
    this.props.GameEventStore.values.autofillGameId.teams = ''
    const len = this.props.GameEventStore.values.participants.length
    for (
      let i = 0;
      i < this.props.GameEventStore.values.participants.length;
      i++
    ) {
      const t = this.props.GameEventStore.values.participants[i]
      this.props.GameEventStore.values.autofillGameId.teams =
        this.props.GameEventStore.values.autofillGameId.teams +
        (i === 0 ? '-' : '')
      this.props.GameEventStore.values.autofillGameId.teams =
        this.props.GameEventStore.values.autofillGameId.teams +
        (t.name ? t.name.charAt(0) + (i < len - 1 ? 'v' : '') : '')
    }
  }

  handleAddTeamClick() {
    this.props.GameEventStore.incrementTeamCount().then(cnt => {
      let participant = {
        id: cnt,
        name: '',
        initial: '',
        topColor: '#000000',
        bottomColor: '#414042',
        showTopColorPicker: false,
        showBottomColorPicker: false,
      }
      this.props.GameEventStore.values.participants.push(participant)
    })
  }

  handleStartDateChange(d) {
    this.dates.dateStart = d
    this.props.GameEventStore.values.dateStart = dateFormat(d, 'yyyy-mm-dd')

    //auto fill gameid
    this.props.GameEventStore.values.autofillGameId.date = ''
    this.props.GameEventStore.values.autofillGameId.date =
      this.props.GameEventStore.values.autofillGameId.date +
      '-' +
      dateFormat(d, 'mmddyyyy')

    //auto fill
    this.dates.dateAnnounce.setTime(d.getTime() - 7 * 24 * 3600 * 1000)
    this.props.GameEventStore.values.dateAnnounce = dateFormat(
      this.dates.dateAnnounce,
      'yyyy-mm-dd 00:00:00'
    )

    //auto fill
    this.dates.datePrePicks.setTime(d.getTime() - 2 * 24 * 3600 * 1000)
    this.props.GameEventStore.values.datePrePicks = dateFormat(
      this.dates.datePrePicks,
      'yyyy-mm-dd 00:00:00'
    )
  }

  handleTimeChange(e) {
    this.props.GameEventStore.values.timeStart = e.target.value
  }

  handleAnnounceDateChange(d) {
    this.props.GameEventStore.values.dateAnnounce = dateFormat(
      d,
      'yyyy-mm-dd 00:00:00'
    )
    this.dates.dateAnnounce = d
  }

  handlePrePicksDateChange(d) {
    this.props.GameEventStore.values.datePrePicks = dateFormat(
      d,
      'yyyy-mm-dd 00:00:00'
    )
    this.dates.datePrePicks = d
  }

  handlePushOperator(newOp) {
    this.props.GameEventStore.values.operators.push(newOp)
    this.toggleScrolling()
  }

  handleRemoveOperator(idx) {
    this.props.GameEventStore.values.operators.splice(idx, 1)
    this.toggleScrolling()
  }

  autoAddParticipant() {
    if (
      this.props.GameEventStore.values.participants &&
      this.props.GameEventStore.values.participants.length === 2
    ) {
      return
    }

    for (let i = 1; i < 3; i++) {
      let participant = {
        gameId: '',
        id: i,
        name: '',
        initial: '',
        score: 0,
        topColor: '#000000',
        bottomColor: '#414042',
        showTopColorPicker: false,
        showBottomColorPicker: false,
      }
      this.props.GameEventStore.values.participants.push(participant)
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

  handleSportTypeHover(type) {
    this.selectedSportType = type
    const el = this[`sporttype-${type.code}`]
    const elImg = this[`sporttype-image-${type.code}`]
    const elText = this[`sporttype-text-${type.code}`]
    if (el && elImg && elText) {
      el.style.backgroundColor = '#18c5ff'
      elImg.src = evalImage(type.icon[1])
      elText.style.color = '#ffffff'
    }
  }

  handleSportTypeOut(type) {
    const el = this[`sporttype-${type.code}`]
    const elImg = this[`sporttype-image-${type.code}`]
    const elText = this[`sporttype-text-${type.code}`]
    if (el && elImg && elText) {
      el.style.backgroundColor = '#d3d3d3'
      elImg.src = evalImage(type.icon[0])
      elText.style.color = 'rgba(0,0,0,0.5)'
    }
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

  componentDidMount() {
    this.autoAddParticipant()
    if (!this.props.GameEventStore.values.timeStart) {
      this.props.GameEventStore.values.timeStart = `00:00`
    }

    this.props.GameEventStore.values.dateStart = dateFormat(
      this.dates.dateStart,
      'yyyy-mm-dd'
    )

    //auto fill
    this.dates.dateAnnounce.setTime(
      this.dates.dateStart.getTime() - 7 * 24 * 3600 * 1000
    )
    this.props.GameEventStore.values.dateAnnounce = dateFormat(
      this.dates.dateAnnounce,
      'yyyy-mm-dd 00:00:00'
    )

    //auto fill
    this.dates.datePrePicks.setTime(
      this.dates.dateStart.getTime() - 2 * 24 * 3600 * 1000
    )
    this.props.GameEventStore.values.datePrePicks = dateFormat(
      this.dates.datePrePicks,
      'yyyy-mm-dd 00:00:00'
    )

    this.props.GameEventStore.values.autofillGameId.dropdown = this.refDDSeason
      ? `-${this.refDDSeason.value}`
      : ''
    this.props.GameEventStore.values.autofillGameId.date =
      '-' + dateFormat(this.dates.dateStart, 'mmddyyyy')
  }

  render() {
    let { GameEventStore } = this.props
    const zoneAbbr = moment.tz().zoneAbbr()

    const isSubSportGenre =
      GameEventStore.values.subSportGenre &&
      Object.keys(GameEventStore.values.subSportGenre).length > 0

    const diff = differenceInCalendarDays(
      this.dates.datePrePicks,
      this.dates.dateAnnounce
    )
    let availDates = []
    let enableDates = []
    for (let i = 1; i < diff; i++) {
      availDates.push(subDays(this.dates.datePrePicks, i))
      enableDates.push(subDays(this.dates.datePrePicks, i))
    }
    availDates.push(subDays(this.dates.dateAnnounce, 1))
    enableDates.push(this.dates.datePrePicks)
    enableDates.push(this.dates.dateAnnounce)
    const highlightWithRanges = [
      {
        'react-datepicker__day--highlighted-custom-1': availDates,
      },
      {
        'react-datepicker__day--highlighted-start': [this.dates.dateStart],
      },
      {
        'react-datepicker__day--highlighted-prepicks': [
          this.dates.datePrePicks,
        ],
      },
      {
        'react-datepicker__day--highlighted-announce': [
          this.dates.dateAnnounce,
        ],
      },
    ]

    const includeWithRanges = enableDates

    const ref = React.createRef()
    const CustomStartDateInput = forwardRef(({ value, onClick }, _ref) => (
      <DatePickerInput src={StartDateIcon} onClick={onClick} ref={_ref}>
        <FormattedDateWrap>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'mmm.')}&nbsp;
          </Label>
          <Label font={'pamainlight'} size={2.6} color={'#000000'} nospacing>
            {dateFormat(value, 'dd')}&nbsp;
          </Label>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'dddd,')}&nbsp;
          </Label>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'yyyy')}
          </Label>
        </FormattedDateWrap>
      </DatePickerInput>
    ))
    const CustomAnnounceDateInput = forwardRef(({ value, onClick }, _ref) => (
      <DatePickerInput
        src={evalImage(`@/assets/images/icon-announce-schedule.svg`)}
        onClick={onClick}
        ref={_ref}
      >
        <FormattedDateWrap>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'mmm.')}&nbsp;
          </Label>
          <Label font={'pamainlight'} size={2.6} color={'#000000'} nospacing>
            {dateFormat(value, 'dd')}&nbsp;
          </Label>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'dddd,')}&nbsp;
          </Label>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'yyyy')}
          </Label>
        </FormattedDateWrap>
      </DatePickerInput>
    ))
    const CustomPrePicksDateInput = forwardRef(({ value, onClick }, _ref) => (
      <DatePickerInput onClick={onClick} ref={_ref}>
        <FormattedDateWrap>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'mmm.')}&nbsp;
          </Label>
          <Label font={'pamainlight'} size={2.6} color={'#000000'} nospacing>
            {dateFormat(value, 'dd')}&nbsp;
          </Label>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'dddd,')}&nbsp;
          </Label>
          <Label font={'pamainbold'} size={1.9} color={'#000000'} nospacing>
            {dateFormat(value, 'yyyy')}
          </Label>
        </FormattedDateWrap>
        <PrePicksDateIcon />
      </DatePickerInput>
    ))

    return (
      <Container
        innerRef={ref => (this.refContainer = ref)}
        isScrolling={this.scrolling}
      >
        <Section direction="column" marginTop={3.5}>
          <InnerSection>
            <Label
              font={'pamainbold'}
              size={1.9}
              color={'#939598'}
              uppercase
              nowrap
            >
              leap type
            </Label>
          </InnerSection>
          <InnerSection widthInPct="100" marginTop={0.5}>
            <DDLeap
              value={GameEventStore.leap.leapType}
              onChange={this.handleLeapTypeChange.bind(this)}
            >
              <option value="">normal game</option>
              <option value="recording">record</option>
              <option value="automate">automate</option>
            </DDLeap>
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
                checked={
                  GameEventStore.leap && GameEventStore.leap.isLeap
                    ? GameEventStore.leap.isLeap
                    : false
                }
                onChange={this.handleLeapChange.bind(this)}
                id="detail-creating-leap-button"
              />
            </LeapWrap>
          </InnerSection>
        </Section>

        {GameEventStore.isLoading ? (
          <Section marginTop="1.5">
            <InnerSection direction="row" alignItems="center">
              <ActivityIndicator />
              <Label font="pamainregular" size="1.5" uppercase>
                loading video or recorded games...
              </Label>
            </InnerSection>
          </Section>
        ) : GameEventStore.leap.leapType &&
          GameEventStore.leap.leapType === 'recording' ? (
          <Section direction="column" marginTop="1.5">
            <InnerSection>
              <Label
                font={'pamainbold'}
                size={1.9}
                color={'#939598'}
                uppercase
                nowrap
              >
                video footage
              </Label>
            </InnerSection>
            <InnerSection marginTop={0.5}>
              <DDVideo
                value={JSON.stringify(GameEventStore.leap.video)}
                onChange={this.handleVideoChange.bind(this)}
              >
                <option
                  value={JSON.stringify({
                    videoFootageId: 0,
                    videoFootageName: '',
                    videoFootagePath: '',
                  })}
                >
                  - select -
                </option>
                {GameEventStore.videos.map(video => (
                  <option
                    key={`video-${video.videoFootageId}`}
                    value={JSON.stringify(video)}
                  >
                    {video.videoFootageName}
                  </option>
                ))}
              </DDVideo>
            </InnerSection>
          </Section>
        ) : GameEventStore.leap.leapType &&
          GameEventStore.leap.leapType === 'automate' ? (
          <Section direction="column" marginTop="1.5">
            <InnerSection>
              <Label
                font={'pamainbold'}
                size={1.9}
                color={'#939598'}
                uppercase
                nowrap
              >
                recorded games
              </Label>
            </InnerSection>
            <InnerSection marginTop={0.5}>
              <DropdownRecordedGame
                height={this.props.GameEventStore.baseHeight}
                items={GameEventStore.recordedGames}
                value={this.handleSelectedGame.bind(this)}
              />
            </InnerSection>
          </Section>
        ) : null

        // GameEventStore.leap.leapType && GameEventStore.leap.leapType === 'automate' ?
        //   GameEventStore.isLoading ? (
        //     <Section marginTop="1.5">
        //       <InnerSection direction="row" alignItems="center">
        //         <ActivityIndicator />
        //         <Label font="pamainregular" size="1.5" uppercase>loading recorded games...</Label>
        //       </InnerSection>
        //     </Section>
        //   ) : (
        //     <Section direction="column" marginTop="1.5">
        //       <InnerSection>
        //         <Label font={'pamainbold'} size={1.9} color={'#939598'} uppercase nowrap>recorded games</Label>
        //       </InnerSection>
        //       <InnerSection marginTop={0.5}>
        //         <DropdownRecordedGame height={this.props.GameEventStore.baseHeight} items={GameEventStore.recordedGames} value={this.handleSelectedGame.bind(this)} />
        //       </InnerSection>
        //     </Section>
        //   ) : null
        }

        <Section marginTop="1">
          <GameIdWrap>
            <Label
              font={'pamainregular'}
              size={2.5}
              color={'#000000'}
              uppercase
              nowrap
            >
              {GameEventStore.values.autofillGameId
                ? GameEventStore.values.autofillGameId.sportType +
                  GameEventStore.values.autofillGameId.eventType +
                  '-'
                : null}
            </Label>
            <DDSeason
              value={GameEventStore.values.autofillGameId.dropdown.replace(
                '-',
                ''
              )}
              onChange={this.handleSeasonChange.bind(this)}
              innerRef={ref => (this.refDDSeason = ref)}
            >
              {GameEventStore.seasons.map(season => {
                return (
                  <option key={season.code} value={season.code}>
                    {season.code}
                  </option>
                )
              })}
            </DDSeason>
            <Label
              font={'pamainregular'}
              size={2.5}
              color={'#000000'}
              uppercase
              nowrap
            >
              {GameEventStore.values.autofillGameId
                ? GameEventStore.values.autofillGameId.generated +
                  GameEventStore.values.autofillGameId.teams +
                  GameEventStore.values.autofillGameId.date
                : null}
            </Label>
          </GameIdWrap>
        </Section>
        {/*
        <Section justifyContent={'space-between'} alignItems={'center'}>
          <TextBox
            readOnly
            type="text"
            widthInPct={100}
            font={'pamainextrabold'}
            value={GameEventStore.values.gameId || ''}
            onChange={this.handleGameIdChange.bind(this)}
          />
        </Section>
*/}

        <SportTypeSection>
          <Section direction={'column'}>
            <Section>
              <Label
                font={'pamainbold'}
                size={1.9}
                color={'#939598'}
                uppercase
                nowrap
              >
                sport type
              </Label>
            </Section>
            <Section marginTop={0.5}>
              <nav>
                <ul>
                  <li className={this.sportTypeNoHover ? 'nohover' : ''}>
                    <SportTypeButton>
                      {GameEventStore.values.sportType &&
                      Object.keys(GameEventStore.values.sportType).length >
                        0 ? (
                        <SportTypeSelected
                          key={`sporttype-selected-${this.selectedSportType.code}`}
                          text={this.selectedSportType.name}
                          color={'#ffffff'}
                          src={evalImage(this.selectedSportType.icon[1])}
                          backgroundColor={'#18c5ff'}
                          opacity={1}
                        />
                      ) : (
                        <SportTypeEmpty />
                      )}
                    </SportTypeButton>
                    <ul>
                      {GameEventStore.sportTypes.map(stype => {
                        return (
                          <li key={stype.code}>
                            <SportType
                              innerRef={ref =>
                                (this[`sporttype-${stype.code}`] = ref)
                              }
                              onMouseOver={this.handleSportTypeHover.bind(
                                this,
                                stype
                              )}
                              onMouseOut={this.handleSportTypeOut.bind(
                                this,
                                stype
                              )}
                            >
                              <SportTypeImage
                                src={evalImage(stype.icon[0])}
                                innerRef={ref =>
                                  (this[`sporttype-image-${stype.code}`] = ref)
                                }
                              />
                              <Label
                                font={'pamainbold'}
                                size={h * 0.4}
                                color={'rgba(0,0,0,0.5)'}
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
                                  <li key={`${stype.code}-${etype.code}`}>
                                    <EventType
                                      text={etype.name}
                                      color={'#000000'}
                                      backgroundColor={'#d3d3d3'}
                                      opacity={0.5}
                                      onClick={this.handleEventTypeClick.bind(
                                        this,
                                        etype
                                      )}
                                      onMouseOver={this.handleSubSportGenreHover.bind(
                                        this,
                                        etype.code
                                      )}
                                      onMouseOut={this.handleSubSportGenreOut.bind(
                                        this,
                                        etype.code
                                      )}
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
          </Section>

          <Section direction={'column'}>
            <Section>
              <Label
                font={'pamainbold'}
                size={1.9}
                color={'#939598'}
                uppercase
                nowrap
              >
                sub sport genre
              </Label>
            </Section>
            <Section marginTop={0.5}>
              <EventTypeSelected
                text={
                  isSubSportGenre
                    ? GameEventStore.values.subSportGenre.name
                    : ''
                }
                color={'#ffffff'}
                backgroundColor={isSubSportGenre ? '#18c5ff' : '#d3d3d3'}
                opacity={1}
              />
            </Section>
          </Section>
        </SportTypeSection>
        {/*
        <SportTypeSection>
          <Section direction={'column'}>
            <Label font={'pamainbold'} size={1.9} color={'#939598'} uppercase nowrap>sport type</Label>
          </Section>
          <Section marginTop={0.5}>
            <SportTypeGrid>
              {
                (GameEventStore.sportTypes || []).map(stype => {
                  return (
                    <SportType
                      key={`sporttype-${stype.name}`}
                      text={stype.name}
                      color={stype.selected ? '#ffffff' : '#000000'}
                      src={evalImage(stype.icon[stype.selected ? 1 : 0])}
                      backgroundColor={stype.selected ? '#18c5ff' : '#d3d3d3'}
                      opacity={stype.selected ? 1 : 0.3}
                      onClick={this.handleSportTypeClick.bind(this, stype)}
                    />
                  )
                })
              }
            </SportTypeGrid>
          </Section>
          <Section marginTop={0.3}>
            <SportTypeGrid>
              {
                (this.eventTypes || []).map(etype => {
                  return (
                    <EventType
                      key={`eventtype-${etype.name}`}
                      text={etype.name}
                      color={etype.selected ? '#ffffff' : '#000000'}
                      backgroundColor={etype.selected ? '#18c5ff' : '#d3d3d3'}
                      opacity={etype.selected ? 1 : 0.3}
                      onClick={this.handleEventTypeClick.bind(this, etype)}
                    />
                  )
                })
              }
            </SportTypeGrid>
          </Section>
        </SportTypeSection>
*/}

        <VenueSection>
          <Section>
            <Label
              font={'pamainbold'}
              size={1.9}
              color={'#939598'}
              uppercase
              nowrap
            >
              venue location
            </Label>
          </Section>
          <Section marginTop={0.5} direction={'row'}>
            <DDState
              value={JSON.stringify(GameEventStore.values.venue.state)}
              onChange={this.handleStateChange.bind(this)}
            >
              <option value={JSON.stringify({ code: '', name: '' })}>
                STATE
              </option>
              {GameEventStore.states.map(loc => (
                <option key={`state-${loc.code}`} value={JSON.stringify(loc)}>
                  {loc.name}
                </option>
              ))}
            </DDState>
            <DDCityWrapper>
              <DDCity
                innerRef={ref => (this.refDDCity = ref)}
                value={JSON.stringify(GameEventStore.values.city)}
                onChange={this.handleCityChange.bind(this)}
              >
                <option
                  value={JSON.stringify({
                    cityId: 0,
                    name: '',
                    lat: '',
                    long: '',
                  })}
                >
                  CITY
                </option>
                {GameEventStore.cities.map(loc => (
                  <option key={`city-${loc.name}`} value={JSON.stringify(loc)}>
                    {loc.name}
                  </option>
                ))}
              </DDCity>
              {this.ddCityBlocker}
            </DDCityWrapper>
            <TextBox
              type="text"
              widthInPct={50}
              placeholder="stadium name"
              value={GameEventStore.values.venue.stadiumName}
              onChange={this.handleStadiumNameChange.bind(this)}
            />
          </Section>
        </VenueSection>

        <TeamsSection>
          <Section>
            <Label
              font={'pamainbold'}
              size={1.9}
              color={'#939598'}
              uppercase
              nowrap
            >
              teams or participants
            </Label>
          </Section>
          <Section direction={'column'} marginTop={0.5}>
            <TeamsPanel>
              {GameEventStore.values.participants.map(participant => {
                return (
                  <ParticipantItem
                    key={participant.id}
                    item={participant}
                    participants={GameEventStore.values.participants}
                    height={GameEventStore.baseHeight}
                    teamUpdated={this.handleTeamUpdated.bind(this)}
                  />
                )
              })}
            </TeamsPanel>
            {/*
                <AddTeamButton onClick={this.handleAddTeamClick.bind(this)}>
                  <PlusSign>+</PlusSign>ADD TEAM/PARTICIPANT
                </AddTeamButton>
*/}
          </Section>
        </TeamsSection>

        <DateAndTimeSection>
          <Section>
            <Label
              font={'pamainbold'}
              size={1.9}
              color={'#939598'}
              uppercase
              nowrap
            >
              game day - date & time - announcement
            </Label>
          </Section>
          <Section marginTop={0.5}>
            <DateGrid>
              <DatePickerWrap>
                <DatePicker
                  selected={this.dates.dateStart}
                  customInput={<CustomStartDateInput ref={ref} />}
                  onChange={this.handleStartDateChange.bind(this)}
                  // highlightDates={highlightWithRanges}
                  // includeDates={includeWithRanges}
                />
              </DatePickerWrap>
              {/*<StarTimeInput*/}
              {/*placeholder="example: 01:30 or 13:30"*/}
              {/*value={GameEventStore.values.timeStart}*/}
              {/*onChange={this.handleTimeChange.bind(this)}*/}
              {/*onFocus={this.handleTimeFocus.bind(this)}*/}
              {/*onBlur={this.handleTimeBlur.bind(this)}*/}
              {/*innerRef={ref => this.refStartTime = ref}*/}
              {/*/>*/}
              <DDStartTime
                value={GameEventStore.values.timeStart}
                onChange={this.handleTimeChange.bind(this)}
              >
                {GameEventStore.startTimes.map((time, idx) => (
                  <option key={`${idx}-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </DDStartTime>
              <AnnounceDateWrap>
                <DatePicker
                  selected={this.dates.dateAnnounce}
                  customInput={<CustomAnnounceDateInput ref={ref} />}
                  onChange={this.handleAnnounceDateChange.bind(this)}
                />
              </AnnounceDateWrap>
              <PrePicksDateWrap>
                <DatePicker
                  selected={this.dates.datePrePicks}
                  customInput={<CustomPrePicksDateInput ref={ref} />}
                  onChange={this.handlePrePicksDateChange.bind(this)}
                />
              </PrePicksDateWrap>
            </DateGrid>
          </Section>
        </DateAndTimeSection>
        <OperatorsSection>
          <Section>
            <Label
              font={'pamainbold'}
              size={1.9}
              color={'#939598'}
              uppercase
              nowrap
            >
              event operators
            </Label>
          </Section>
          <Section marginTop="0.5" marginBottom={this.scrolling ? 1 : 0}>
            <Operators
              height={this.props.GameEventStore.baseHeight}
              operators={GameEventStore.values.operators}
              pushOperator={this.handlePushOperator.bind(this)}
              removeOperator={this.handleRemoveOperator.bind(this)}
            />
          </Section>
        </OperatorsSection>
      </Container>
    )
  }
}

let h = 0
const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-left: ${vhToPx(3)};
  padding-right: ${vhToPx(3)};

  overflow-y: ${props => (props.isScrolling ? 'scroll' : 'none')};
  -webkit-overflow-scrolling: touch;

  -ms-overflow-style: ${props =>
    props.isScrolling ? '-ms-autohiding-scrollbar;' : 'none'};
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 ${props => vhToPx(0)} rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar {
    width: ${props => vhToPx(0)};
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    -webkit-box-shadow: inset 0 0 ${props => vhToPx(props.isScrolling ? 1 : 0)}
      rgba(0, 0, 0, 0.3);
    background-color: rgba(85, 85, 85, 0.5);
    &:hover {
      background-color: #555;
    }
  }

  &:hover::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 ${props => vhToPx(props.isScrolling ? 1 : 0)}
      rgba(0, 0, 0, 0.3);
  }

  &:hover::-webkit-scrollbar {
    width: ${props => vhToPx(props.isScrolling ? 1 : 0)};
  }

  &:hover {
    padding-right: ${props => (props.isScrolling ? vhToPx(2.1) : vhToPx(3))};
  }
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

const InnerSection = styled.div`
  text-align: center;
  display: flex;
  ${props => (props.widthInPct ? `width:${props.widthInPct}%` : ``)};
  ${props => (props.height ? `height:${vhToPx(props.height)}` : ``)};
  ${props => (props.direction ? `flex-direction:${props.direction}` : ``)};
  ${props =>
    props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => (props.alignItems ? `align-items:${props.alignItems};` : ``)};
  ${props => (props.marginTop ? `margin-top:${vhToPx(props.marginTop)}` : ``)};
  ${props =>
    props.marginBottom ? `margin-bottom:${vhToPx(props.marginBottom)}` : ``};
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

const TextBox = styled.input`
  font-family: ${props => props.font || 'pamainbold'};
  font-size: ${props => vhToPx(h * 0.45)};
  width: ${props => props.widthInPct}%;
  height: ${props => vhToPx(h)};
  border: none;
  outline: none;
  text-indent: ${props => vwToPx(0.5)};
  padding-right: 3%;
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

const GameIdWrap = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  display: flex;
  //justify-content: space-between;
  flex-direction: row;
  align-items: center;
`

const SportTypeSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: ${props => vhToPx(3)};
`

const SportTypeGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: ${props => vwToPx(0.2)};
`

const SportType = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #d3d3d3;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`

const SportTypeImage = styled.img`
  height: ${props => vhToPx(h * 0.7)};
  margin: 0 ${props => vhToPx(1.5)} 0 ${props => vhToPx(1.5)};
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

const EventTypeSelected = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  align-items: center;
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
  border: ${props => vhToPx(0.1)} solid #c8c8c8;
  padding-left: ${props => vhToPx(1.5)}
`

const SportTypeXXX = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #d3d3d3;
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

  &:hover {
    background-color: #18c5ff;
    &:before {
      background-image: url(${props => props.srcSelected});
      opacity: 1;
    }
    &:after {
      color: #ffffff;
      opacity: 1;
    }

  }
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
    opacity: ${props => props.opacity};
  }
  padding-left: ${props => vhToPx(1.5)};

  &:hover {
    background-color: #18c5ff;
    &:after {
      color: #ffffff;
      opacity: 1;
    }
  }

`

const VenueSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: ${props => vhToPx(3)};
`

const DDState = styled.select`
  width: 25%;
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

  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  line-height: 1;
  text-transform: uppercase;
`

const DDSeason = styled.select`
  //width: ${props => vwToPx(4)};
  width: auto;
  height: ${props => vhToPx(h * 0.7)};
  outline: none;
  border: none;
  text-align-last: center;
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.55)};
  color: #000000;
  line-height: 0.9;
  text-transform: uppercase;
  margin-top: 1%;
  background-color: yellow;
`
const DDCityWrapper = styled.div`
  position: relative;
  width: 25%;
  height: ${props => vhToPx(h)};
`

const DDCityBlocker = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100;
  display: flex;
  justify-content: flex-end;
`

const DDCity = styled.select`
  position: absolute;
  width: 100%;
  height: 100%;
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-size: ${props => vhToPx(2)};
  text-align-last: center;
  margin-right: ${props => vhToPx(0.2)};

  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  line-height: 1;
  text-transform: uppercase;
`

const TeamsSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${props => vhToPx(3)};
`

const TeamsPanel = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const AddTeamButton = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #a7a9ac;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  cursor: pointer;
  letter-spacing: ${props => vhToPx(0.1)};
  margin-top: ${props => vhToPx(0.3)};
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  color: #eaeaea;
  line-height: 1;
`

const PlusSign = styled.span`
  height: inherit;
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.5)};
  display: flex;
  justify-content: center;
  align-items: center;
`

const DateAndTimeSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${props => vhToPx(3)};
`

const DateGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: ${props => vwToPx(0.1)};
`

const DatePickerWrap = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #ffffff;
`

const DatePickerInput = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  &:after {
    position: absolute;
    width: ${props => vhToPx(h * 0.6)};
    height: ${props => vhToPx(h * 0.6)};
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    ${props =>
      props.srcRotate ? `transform: rotate(${props.srcRotate}deg);` : ''};
    left: 85%;
  }
`

const FormattedDateWrap = styled.div`
  display: flex;
  align-items: flex-end;
`

const PrePicksDateIcon = styled.div`
  position: absolute;
  height: ${props => vhToPx(h)};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  left: 86%;
  &:before {
    content: '';
    display: inline-block;
    width: ${props => vhToPx(1.9)};
    height: ${props => vhToPx(1.9)};
    min-width: ${props => vhToPx(1.9)};
    min-height: ${props => vhToPx(1.9)};
    border: ${props => vhToPx(0.1)} solid #000000;
    border-radius: ${props => vhToPx(0.3)};
    margin-bottom: 4%;
  }
  &:after {
    content: '';
    display: inline-block;
    width: ${props => vhToPx(1.9)};
    height: ${props => vhToPx(1.9)};
    min-width: ${props => vhToPx(1.9)};
    min-height: ${props => vhToPx(1.9)};
    background-color: #000000;
    border-radius: ${props => vhToPx(0.3)};
    margin-top: 4%;
  }
`

const DDStartTime = styled.select`
  width: 100%;
  height: ${props => vhToPx(h)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  margin-right: ${props => vhToPx(0.2)};
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.6)};
  line-height: 0.9;
  text-indent: ${props => vwToPx(0.5)};
  text-transform: uppercase;
  background-image: url(${StartTimeIcon});
  background-repeat: no-repeat;
  background-size: 12%;
  background-position: 96%;
`

const AnnounceDateWrap = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #18c5ff;
`

const PrePicksDateWrap = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #0fbc1c;
`

const OperatorsSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${props => vhToPx(3)};
`

const SportTypeButton = styled.div`
  width: ${props => vhToPx(20)};
  height: ${props => vhToPx(h)};
  display: flex;
  cursor: pointer;
  border: ${props => vhToPx(0.1)} solid #c8c8c8;
`

const SportTypeEmpty = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  padding-left: ${props => vhToPx(1.5)};
  background-color: #d3d3d3;
  align-items: center;
  &:after {
    content: 'SELECT A SPORT TYPE';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.4)};
    color: #000000;
    opacity: 0.5;
    line-height: 1;
  }
`

const DDLeapX = styled.select`
  width: 100%;
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

  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  line-height: 1;
  text-transform: uppercase;
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
  margin: 0 6% 0 0;
`

const LeapWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const LeapLabel = styled.span`
  font-family: pamainextrabold;
  font-size: ${props => vhToPx(3)};
  color: #000000;
  white-space: nowrap;
  text-transform: uppercase;
`

const DDVideo = styled.select`
  width: 85%;
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
`

const seasonId = () => {
  var S4 = () => {
    return (((1 + Math.random()) * 0x1000000) | 0).toString(16).substring(1)
  }

  return S4().toLowerCase()
}
