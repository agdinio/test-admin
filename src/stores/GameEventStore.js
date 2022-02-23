import { observable, action } from 'mobx'
import agent from '@/Agent'
import config from '@/Agent/config'
import geo from '@/Agent/GeoLocation'
import { timestampToDate } from '@/utils'
import dateFormat from 'dateformat'
import Sponsors from '@/stores/SponsorItems'
import CommonStore from '@/stores/CommonStore'
import OperatorStore from '@/stores/OperatorStore'
import PrePlayStore from '@/stores/PrePlayStore'
import moment from 'moment-timezone'
import crypto from 'crypto'

class GameEventStore {
  @observable
  isLoading = false

  startTimes = [
    '00:00',
    '00:30',
    '01:00',
    '01:30',
    '02:00',
    '02:30',
    '03:00',
    '03:30',
    '04:00',
    '04:30',
    '05:00',
    '05:30',
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
    '22:30',
    '23:00',
    '23:30',
  ]

  /*
    panels: {big: , small: },
    viewed: {big: , small: },
    lp: {big: , small: },
    gm: {big: , small: },
    sp: {big: , small: },
    vd: {big: , small: },
    pr: {big: , small: },
    str: {big: , small: },
    ann: {big: , small: },
  */

  sportTypes = []

  sportTypeIcons = [
    {
      id: 1,
      name: 'football',
      code: 'fb',
      icon: ['icon-football.svg', 'icon-football-white.svg'],
      eventTypes: [
        { name: 'nfl', code: 'nfl' },
        { name: 'ncaa', code: 'ncaa' },
      ],
    },
    {
      id: 2,
      name: 'basketball',
      code: 'bb',
      icon: ['icon-basketball.svg', 'icon-basketball-white.svg'],
      eventTypes: [
        { name: 'nba', code: 'nba' },
        { name: 'ncaa', code: 'ncaa' },
      ],
    },
    {
      id: 3,
      name: 'golf',
      code: 'golf',
      icon: ['icon-golf.svg', 'icon-golf-white.svg'],
      eventTypes: [
        { name: 'pga', code: 'pga' },
        { name: 'masters', code: 'masters' },
        { name: 'asian', code: 'asian' },
        { name: 'european', code: 'european' },
      ],
    },
  ]

  flagshipSponsor = {
    id: 123,
    selected: true,
    panels: { big: 20, small: 65 },
    viewed: { big: 5000, small: 45000 },
    lp: { big: '5/2000', small: '15/8000' },
    gm: { big: '10/100', small: '10/3000' },
    sp: { big: '6/1200', small: '15/2000' },
    vd: { big: '2/40', small: '5/2000' },
    pr: { big: '1/500', small: '10/500' },
    str: { big: 2, small: 5 },
    ann: { big: '2/100', small: '10/2000' },
  }

  availableSponsors = [
    {
      sequence: 1,
      id: 1,
      selected: true,
      panels: { big: 25, small: 50 },
      viewed: { big: 5000, small: 30000 },
      lp: { big: '5/2000', small: '15/8000' },
      gm: { big: '10/100', small: '10/3000' },
      sp: { big: '6/1200', small: '15/2000' },
      vd: { big: '2/40', small: '5/2000' },
      pr: { big: '1/500', small: '10/500' },
      str: { big: 1, small: 2 },
      ann: { big: '2/100', small: '10/2000' },
    },
    {
      sequence: 2,
      id: 1,
      selected: true,
      panels: { big: 50, small: 50 },
      viewed: { big: 5000, small: 30000 },
      lp: { big: '5/2000', small: '15/8000' },
      gm: { big: '10/100', small: '10/3000' },
      sp: { big: '6/1200', small: '15/2000' },
      vd: { big: '2/40', small: '5/2000' },
      pr: { big: '2/2000', small: '10/500' },
      str: { big: 1, small: 2 },
      ann: { big: '2/100', small: '10/2000' },
    },
    { sequence: 3, id: 1, selected: false },
    {
      sequence: 4,
      id: 4,
      selected: true,
      panels: { big: 30, small: 35 },
      viewed: { big: 5000, small: 15000 },
      lp: { big: '5/2000', small: '10/8000' },
      gm: { big: '10/100', small: '5/3000' },
      sp: { big: '6/1200', small: '10/2000' },
      vd: { big: '2/40', small: '5/2000' },
      pr: { big: '1/0', small: '5/500' },
      str: { big: 1, small: 1 },
      ann: { big: '2/100', small: '10/2000' },
    },
    { sequence: 5, id: 4, selected: false },
    {
      sequence: 6,
      id: 4,
      selected: true,
      panels: { big: 18, small: 35 },
      viewed: { big: 5000, small: 15000 },
      lp: { big: '5/2000', small: '10/8000' },
      gm: { big: '10/100', small: '5/3000' },
      sp: { big: '6/1200', small: '10/2000' },
      vd: { big: '2/40', small: '5/2000' },
      pr: { big: '3/0', small: '5/500' },
      str: { big: 0, small: 1 },
      ann: { big: '2/100', small: '10/2000' },
    },
    { sequence: 7, id: 4, selected: false },
    { sequence: 8, id: 4, selected: false },
    {
      sequence: 9,
      id: 4,
      selected: true,
      panels: { big: 21, small: 35 },
      viewed: { big: 5000, small: 15000 },
      lp: { big: '5/2000', small: '10/8000' },
      gm: { big: '10/100', small: '5/3000' },
      sp: { big: '6/1200', small: '10/2000' },
      vd: { big: '2/40', small: '5/2000' },
      pr: { big: '1/0', small: '5/500' },
      str: { big: 2, small: 1 },
      ann: { big: '2/100', small: '10/2000' },
    },
    {
      sequence: 10,
      id: 3,
      selected: true,
      panels: { big: 8, small: 20 },
      viewed: { big: 1800, small: 5000 },
      lp: { big: '1/1000', small: '5/8000' },
      gm: { big: '1/100', small: '10/3000' },
      sp: { big: '1/800', small: '5/2000' },
      vd: { big: null, small: '0/0' },
      pr: { big: null, small: '0/0' },
      str: { big: 1, small: 1 },
      ann: { big: '3/150', small: '5/500' },
    },
    { sequence: 11, id: 3, selected: false },
    { sequence: 12, id: 3, selected: false },
    {
      sequence: 13,
      id: 3,
      selected: true,
      panels: { big: 10, small: 20 },
      viewed: { big: 3200, small: 5000 },
      lp: { big: '3/2000', small: '5/8000' },
      gm: { big: '2/100', small: '10/3000' },
      sp: { big: '2/1200', small: '5/2000' },
      vd: { big: null, small: '0/0' },
      pr: { big: null, small: '0/0' },
      str: { big: 0, small: 0 },
      ann: { big: '2/300', small: '5/500' },
    },
    { sequence: 14, id: 3, selected: false },
    {
      sequence: 15,
      id: 2,
      selected: true,
      panels: { big: 5, small: 10 },
      viewed: { big: 1000, small: 2000 },
      lp: { big: '2/2000', small: '5/8000' },
      gm: { big: '10/100', small: '0/0' },
      sp: { big: '5/2200', small: '5/2000' },
      vd: { big: null, small: '0/0' },
      pr: { big: null, small: '0/0' },
      str: { big: 0, small: 0 },
      ann: { big: '2/200', small: '5/500' },
    },
    { sequence: 16, id: 2, selected: false },
    { sequence: 17, id: 2, selected: false },
    { sequence: 18, id: 2, selected: false },
  ]

  baseHeight = 4.6

  @observable
  values = {
    autofillGameId: {
      sportType: '',
      eventType: '',
      dropdown: '',
      generated: '',
      teams: '',
      date: '',
    },
    stage: '',
    gameId: '',
    sportType: {},
    subSportGenre: {},
    venue: {
      countryCode: 'US',
      state: {},
      city: {},
      latitude: '',
      longitude: '',
      stadiumName: '',
    },
    participants: [],
    dateStart: '',
    timeStart: '',
    dateAnnounce: '',
    datePrePicks: '',
    prePicks: [],
    livePlays: [],
    operators: [],
    isLeap: false,
    leapType: '',
    video: null,
  }

  @action
  setValues(val) {
    this.values = val
  }

  @action
  resetValues() {
    this.values = {
      autofillGameId: {
        sportType: '',
        eventType: '',
        dropdown: '',
        generated: '',
        teams: '',
        date: '',
      },
      stage: '',
      gameId: '',
      sportType: {},
      subSportGenre: {},
      venue: {
        countryCode: 'US',
        state: {},
        city: {},
        latlong: '',
        stadiumName: '',
      },
      participants: [],
      dateStart: '',
      timeStart: '',
      dateAnnounce: '',
      datePrePicks: '',
      prePicks: [],
      livePlays: [],
      operators: [],
      isLeap: false,
      leapType: '',
      video: null,
    }

    this.locations = []
    this.cities = []
  }

  requiredValues = {
    sportType: { text: 'sport type' },
    subSportGenre: { text: 'sub sport genre' },
    venue: {
      text: 'venue',
      state: { text: 'state' },
      city: { text: 'city' },
      stadiumName: { text: 'stadium' },
    },
    participants: { text: 'participants' },
  }

  @observable
  isUpdating = false
  @action
  setUpdating(val) {
    this.isUpdating = val
  }

  unchangedValues = {}
  @action
  setUnchangedValues(val) {
    this.unchangedValues = val
  }
  @action
  resetUnchangedValues() {
    this.unchangedValues = {}
  }

  @observable
  teamCount = 0

  @action
  incrementTeamCount() {
    this.teamCount += 1
    return Promise.resolve(this.teamCount)
  }

  gameStatus = {
    active: {
      bg: '#ffffff',
      text: 'active',
      color: '#000000',
      invertedColor: '#ffffff',
      prePicksEditable: true,
      slidingButton: { text: 'details', color: '#000000', bg: '#E5E5E5' },
    },
    public: {
      bg: '#e6e7e8',
      text: 'public',
      color: '#000000',
      invertedColor: '#ffffff',
      prePicksEditable: true,
      slidingButton: { text: 'edit prepicks', color: '#ffffff', bg: '#22ba2c' },
    },
    pregame: {
      bg: '#22ba2c',
      text: 'PRE-GAME',
      color: '#ffffff',
      invertedColor: '#22ba2c',
      prePicksEditable: false,
      slidingButton: { text: 'access h-comm', color: '#ffffff', bg: '#18c5ff' },
    },
    pending: {
      bg: '#efdf17',
      text: 'PENDING',
      color: '#000000',
      invertedColor: '#efdf17',
      prePicksEditable: false,
      slidingButton: { text: 'access h-comm', color: '#ffffff', bg: '#18c5ff' },
    },
    live: {
      bg: '#c61818',
      text: 'LIVE',
      color: '#ffffff',
      invertedColor: '#c61818',
      prePicksEditable: false,
      slidingButton: { text: 'join h-comm', color: '#ffffff', bg: '#c61818' },
    },
    postgame: {
      bg: '#4d92ad',
      text: 'POST-GAME',
      color: '#ffffff',
      invertedColor: '#ffffff',
      prePicksEditable: false,
      slidingButton: { text: 'access stats', color: '#ffffff', bg: '#808285' },
    },
    end: {
      bg: '#3d3d3d',
      text: 'END',
      color: '#ffffff',
      invertedColor: '#ffffff',
      prePicksEditable: false,
      slidingButton: { text: 'access stats', color: '#ffffff', bg: '#808285' },
    },
  }

  @observable
  teamUpdated = false

  @action
  setTeamUpdated(val) {
    this.teamUpdated = val
  }

  @observable
  badges = {
    live: 0,
    pending: 0,
    pregame: 0,
    postgame: 0,
  }

  @action
  incrementBadge(status, count) {
    this.badges[status] += count
  }

  @action
  resetBadge() {
    this.badges = {
      live: 0,
      pending: 0,
      pregame: 0,
      postgame: 0,
    }
  }

  locations = []
  states = []

  @observable
  cities = []

  seasons = []

  @action
  getStates() {
    return new Promise(resolve => {
      this.locations = geo
      this.states = geo.filter(
        (v, i, a) => a.findIndex(t => t.state === v.state) === i
      )
      /*
            Find unique id's or id's in an array.
            arr.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i)

            Unique by multiple properties ( place and name )
            arr.filter((v,i,a)=>a.findIndex(t=>(t.place === v.place && t.name===v.name))===i)
            Unique by all properties (This will be slow for large arrays)
            arr.filter((v,i,a)=>a.findIndex(t=>(JSON.stringify(t) === JSON.stringify(v)))===i)

            Keep the last occurrence. Add slice and reverse to beginning and reverse again in the end.
            arr.slice().reverse().filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i).reverse()
      */
      resolve(this.states)
    })
  }

  getEventsBySportType(option) {
    return agent.GameEvent.readGameEvents(option)
      .then(async data => {
        console.log('RAW...', JSON.parse(JSON.stringify(data.data.data)))

        let parsedEvents = []
        for (let i = 0; i < data.data.data.length; i++) {
          debugger
          const _event = data.data.data[i]

          const _sportType = await JSON.parse(
            JSON.stringify(this.sportTypes)
          ).filter(o => o.code === _event.sportType)[0]
          const _subSportGenre = await _sportType.eventTypes.filter(
            o => o.code === _event.subSportGenre
          )[0]

          const _latlong = _event.latlong.split(',')
          _event.venue = {
            countryCode: _event.countryCode,
            state: { code: _event.stateCode, name: _event.stateName },
            city: {
              name: _event.city,
              lat: _latlong.length > 1 ? _latlong[0] : '',
              long: _latlong.length > 1 ? _latlong[1] : '',
            },
            latitude: '',
            longitude: '',
            stadiumName: _event.stadium,
          }

          _event.dateAnnounce = dateFormat(
            _event.dateAnnounce,
            'yyyy-mm-dd 00:00:00'
          )
          _event.datePrePicks = dateFormat(
            _event.datePrePicks,
            'yyyy-mm-dd 00:00:00'
          )
          _event.dateStart = dateFormat(_event.dateStart, 'yyyy-mm-dd')
          //_event.timeStart = dateFormat(_event.timeStart, 'HH:MM')
          _event.timeStart = _event.formattedTimeStart

          delete _event.city
          delete _event.countryCode
          delete _event.latlong
          delete _event.stateCode
          delete _event.stateName

          // let item = await parsedEvents.filter(o => o.keyEventType === _event.subSportGenre && o.keySportType.code === _event.sportType)[0]
          let item = await parsedEvents.filter(
            o =>
              o.subSportGenreCode === _event.subSportGenre &&
              o.keySportType.code === _event.sportType
          )[0]
          if (item) {
            item.events.push(_event)
          } else {
            item = {
              subSportGenreCode: _subSportGenre.code,
              keyEventType: _subSportGenre.name,
              keySportType: _sportType,
              events: [],
            }
            item.events.push(_event)
            parsedEvents.push(item)
          }

          _event.sportType = _sportType
          _event.subSportGenre = _subSportGenre
        }

        console.log('PARSED...', parsedEvents)

        return Promise.resolve(parsedEvents)
      })
      .catch(err => {
        CommonStore.setErrorResponse(err.response)
      })
  }

  readGameById(gameId) {
    this.isLoading = true
    return agent.GameEvent.readGameById(gameId)
      .then(async data => {
        console.log('RAW...', JSON.parse(JSON.stringify(data.data.data)))
        const _event = data.data.data

        PrePlayStore.sponsors = await this.extractSponsors(
          _event.sponsorPackages
        )

        const _sportType = await JSON.parse(
          JSON.stringify(this.sportTypes)
        ).filter(o => o.code === _event.sportType)[0]
        const _subSportGenre = await _sportType.eventTypes.filter(
          o => o.code === _event.subSportGenre
        )[0]
        const _latlong = _event.latlong.split(',')

        if (_event.participants && _event.participants.length > 0) {
          _event.participants.forEach(t => {
            t.id = t.sequence
            t.showTopColorPicker = false
            t.showBottomColorPicker = false
          })
        }

        for (let x = _event.prePicks.length - 1; x >= 0; x--) {
          const p = _event.prePicks[x]
          if (!p.prePickId) {
            _event.prePicks.splice(x, 1)
          } else {
            p.questionHeader = JSON.parse(
              JSON.parse(JSON.stringify(p.questionHeader.replace(/'/g, '"')))
            ).value
            p.questionDetail = JSON.parse(
              JSON.parse(JSON.stringify(p.questionDetail.replace(/'/g, '"')))
            )[0].value
            p.choices = JSON.parse(
              JSON.parse(JSON.stringify(p.choices.replace(/'/g, '"')))
            )

            p.info = {
              value: p.info.replace(/\'/g, '"'),
              font: 'pamainbold',
              color: '#000000',
            }
            if (p.choiceType === 'ab') {
              for (let c = 0; c < p.choices.length; c++) {
                p.choices[c] = Object.assign(
                  {},
                  await _event.participants.filter(
                    o => o.sequence === p.choices[c].id
                  )[0]
                )
              }
            }

            if (p.forParticipant) {
              p.forParticipant = JSON.parse(
                JSON.parse(JSON.stringify(p.forParticipant.replace(/'/g, '"')))
              )
              if (Object.keys(p.forParticipant).length > 0) {
                p.forParticipant = {
                  ...(await _event.participants.filter(
                    o => o.sequence === p.forParticipant.id
                  )[0]),
                }
              }
            }

            p.sponsor = await this.getSelectedSponsor(p.sponsorId)
          }
        }

        let parsedValues = {
          stage: _event.stage,
          gameId: _event.gameId,
          sportType: _sportType,
          subSportGenre: _subSportGenre,
          venue: {
            countryCode: _event.countryCode,
            state: { code: _event.stateCode, name: _event.stateName },
            city: {
              name: _event.city,
              lat: _latlong.length > 1 ? _latlong[0] : '',
              long: _latlong.length > 1 ? _latlong[1] : '',
            },
            latitude: '',
            longitude: '',
            stadiumName: _event.stadium,
          },
          participants: _event.participants,

          dateStart: dateFormat(_event.dateStart, 'yyyy-mm-dd'),
          //timeStart: dateFormat(_event.timeStart, 'HH:MM'),
          timeStart: _event.formattedTimeStart,
          dateAnnounce: dateFormat(_event.dateAnnounce, 'yyyy-mm-dd 00:00:00'),
          datePrePicks: dateFormat(_event.datePrePicks, 'yyyy-mm-dd 00:00:00'),
          dateStartSession: _event.dateStartSession,
          dateEndSession: _event.dateEndSession,

          prePicks: _event.prePicks,
          livePlays: [],
          operators: [],
          isLeap: _event.isLeap,
          leapType: _event.leapType,
          video: {
            videoFootageId: _event.videoFootageId,
            videoFootageName: _event.videoFootageName,
            videoFootagePath: _event.videoFootagePath,
          },
          playCount: _event.playCount,
        }

        this.leap = {
          gameId: _event.gameId,
          isLeap: _event.isLeap,
          leapType: _event.leapType,
          video: {
            videoFootageId: _event.videoFootageId,
            videoFootageName: _event.videoFootageName,
            videoFootagePath: _event.videoFootagePath,
          },
        }

        PrePlayStore.sponsors = await this.extractSponsors(
          _event.sponsorPackages
        )

        console.log('PARSED...', parsedValues)
        try {
          sessionStorage.setItem('EVENT_VALUES', JSON.stringify(parsedValues))
          sessionStorage.setItem(
            'EVENT_UNCHANGED_VALUES',
            JSON.stringify(parsedValues)
          )
        } catch (e) {}
        this.values = Object.assign({}, parsedValues)
        this.unchangedValues = Object.assign({}, parsedValues)

        this.isLoading = false
        return Promise.resolve(true)
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }

  extractSponsors(sponsorPackages) {
    return new Promise(async resolve => {
      debugger
      const _sponsors = []
      for (let i = 0; i < sponsorPackages.length; i++) {
        const _raw = sponsorPackages[i]
        const _sponsor = await _sponsors.filter(
          o => o.id === _raw.package_id
        )[0]
        if (_sponsor) {
          if (_raw.sponsor_id) {
            await _sponsor.brands.push({
              brandId: _raw.sponsor_id,
              brandName: _raw.sponsor_name,
              brandImage: `${config.SECURE_PROTOCOL}://${config.URL}/${config.IMAGE_FOLDER}/${_raw.sponsor_image}`,
              brandExposureCount: _raw.sponsor_exposure_count,
            })
          }
        } else {
          await _sponsors.push({
            id: _raw.package_id,
            name: _raw.package_name,
            initial: _raw.package_initial,
            initialColor: _raw.package_initial_color,
            backgroundColor: _raw.package_background_color,
            circleBorderColor: _raw.package_circle_border_color,
            circleFill: _raw.package_circle_fill,
            brands: [
              {
                brandId: _raw.sponsor_id,
                brandName: _raw.sponsor_name,
                brandImage: `${config.SECURE_PROTOCOL}://${config.URL}/${config.IMAGE_FOLDER}/${_raw.sponsor_image}`,
                brandExposureCount: _raw.sponsor_exposure_count,
              },
            ],
          })
        }
      }

      return resolve(_sponsors)
    })
  }

  deleteGame(gameId) {
    return agent.GameEvent.deleteGame(gameId)
  }

  readGameEventInfo() {
    if (this.sportTypes && this.sportTypes.length > 0) {
      return Promise.resolve(true)
    }

    this.isLoading = true
    return agent.GameEvent.readGameEventInfo({})
      .then(async data => {
        this.states = data.data.data.states
        this.seasons = data.data.data.seasons

        for (let i = 0; i < data.data.data.sportTypes.length; i++) {
          const raw = data.data.data.sportTypes[i]
          const _rawIcon = await this.sportTypeIcons.filter(
            o => o.code === raw.code
          )[0]
          raw.icon =
            _rawIcon && _rawIcon.icon && _rawIcon.icon.length > 0
              ? _rawIcon.icon
              : [raw.icon]
          delete Object.assign(raw, { ['eventTypes']: raw['subSportGenres'] })[
            'subSportGenres'
          ]
        }

        this.sportTypes = data.data.data.sportTypes
        return true
      })
      .catch(err => {
        CommonStore.setErrorResponse(err.response)
      })
      .finally(_ => {
        this.isLoading = false
      })
  }

  @action
  saveEvent() {
    this.values.stage =
      this.values.leapType === 'recording' ? 'pending' : 'active'
    this.values.gameId =
      this.values.autofillGameId.sportType +
      this.values.autofillGameId.eventType +
      this.values.autofillGameId.dropdown +
      this.values.autofillGameId.generated +
      this.values.autofillGameId.teams +
      this.values.autofillGameId.date

    let participantsToSave = []
    const participants = JSON.parse(JSON.stringify(this.values.participants))
    participants.forEach(t => {
      participantsToSave.push({
        participantId: 0,
        sequence: t.id,
        gameId: this.values.gameId,
        initial: t.initial,
        score: t.score,
        name: t.name,
        topColor: t.topColor,
        bottomColor: t.bottomColor,
      })
      t.gameId = this.values.gameId
      delete t.id
      delete t.showTopColorPicker
      delete t.showBottomColorPicker
    })

    const prePicksToSave = []
    for (let j = 0; j < this.values.prePicks.length; j++) {
      const p = this.values.prePicks[j]
      let _choices = []
      p.choices.forEach(item => {
        item.name
        _choices.push({ id: item.id, value: item.name || item.value })
      })

      const toPush = {
        prePickId: 0,
        gameId: this.values.gameId,
        sequence: p.sequence,
        questionHeader: JSON.stringify({
          value: p.questionHeader,
          color: '#22ba2c',
        }).replace(/"/g, "'"),
        questionDetail: JSON.stringify([
          { sequence: 1, value: p.questionDetail, color: '#22ba2c' },
        ]).replace(/"/g, "'"),
        choiceType: p.choiceType,
        choices: JSON.stringify(_choices),
        points: 2000,
        tokens: 50,
        forParticipant:
          p.forParticipant && Object.keys(p.forParticipant).length > 0
            ? JSON.stringify({ id: p.forParticipant.id }).replace(/"/g, "'")
            : JSON.stringify({}).replace(/"/g, "'"),
        shortHand: '',
        type: 'PrePick',
        backgroundImage: '',
        info: p.info.value.replace(/"/g, "'"),
        sponsorId:
          p.sponsor && p.sponsor.sponsorItem && p.sponsor.sponsorItem.brandId
            ? p.sponsor.sponsorItem.brandId
            : 0,
      }

      prePicksToSave.push(toPush)
    }

    const timeStart = '1980-01-01 ' + this.values.timeStart
    const sportType = this.values.sportType.code
    const subSportGenre = this.values.subSportGenre.code

    const event = {
      gameId: this.values.gameId,
      stage: this.values.stage,
      sportType: sportType,
      subSportGenre: subSportGenre,
      isLeap: this.leap && this.leap.isLeap ? this.leap.isLeap : false,
      leapType: this.values.leapType,
      videoFootageId: this.values.video ? this.values.video.videoFootageId : 0,
      dateStart: this.values.dateStart,
      timeStart: timeStart,
      dateAnnounce: this.values.dateAnnounce,
      datePrePicks: this.values.datePrePicks,
      countryCode: this.values.venue.countryCode,
      stateCode: this.values.venue.state.code,
      city: this.values.venue.city.name,
      latlong: `${this.values.venue.city.lat}, ${this.values.venue.city.long}`,
      stadium: this.values.venue.stadiumName,
      participants: participantsToSave,
      prePicks: prePicksToSave,
    }

    return agent.GameEvent.create(event)
      .then(res => {
        if (res) {
          this.leap.gameId = this.values.gameId
          this.values = Object.assign({}, this.values)
          this.unchangedValues = Object.assign({}, this.values)
          this.isUpdating = false
          return Promise.resolve(true)
        }
      })
      .catch(err => {
        CommonStore.setErrorResponse(err.response)
      })
  }

  //TO BE DELETED
  saveEventGraphQL() {
    this.values.stage =
      this.values.leapType === 'recording' ? 'pending' : 'active'
    this.values.gameId =
      this.values.autofillGameId.sportType +
      this.values.autofillGameId.eventType +
      this.values.autofillGameId.dropdown +
      this.values.autofillGameId.generated +
      this.values.autofillGameId.teams +
      this.values.autofillGameId.date

    let participantsGraphQL = []
    const participants = JSON.parse(JSON.stringify(this.values.participants))
    participants.forEach(t => {
      participantsGraphQL += `{
        participantId: 0,
        sequence: ${t.id},
        gameId: "${this.values.gameId}",
        initial: "${t.initial}",
        score: ${t.score},
        name: "${t.name}",
        topColor: "${t.topColor}",
        bottomColor: "${t.bottomColor}"
      },`

      t.gameId = this.values.gameId
      delete t.id
      delete t.showTopColorPicker
      delete t.showBottomColorPicker
    })

    let prePicksGraphQL = ''
    let prePicks = []
    for (let j = 0; j < this.values.prePicks.length; j++) {
      const p = this.values.prePicks[j]
      //const _qSplit = p.question.split(',')
      //const header = _qSplit[0]
      //const detail = _qSplit.length > 1 ? _qSplit[1] : ''

      let _choices = []
      p.choices.forEach(item => {
        item.name
        _choices.push({ id: item.id, value: item.name || item.value })
      })

      const toPush = {
        gameId: this.values.gameId,
        sequence: p.sequence,
        questionHeader: JSON.stringify({
          value: p.questionHeader,
          color: '#22ba2c',
        }),
        questionDetail: JSON.stringify([
          { sequence: 1, value: p.questionDetail, color: '#22ba2c' },
        ]),
        choiceType: p.choiceType,
        choices: JSON.stringify(_choices),
        points: 2000,
        tokens: 50,
        forParticipant:
          p.forParticipant && Object.keys(p.forParticipant).length > 0
            ? JSON.stringify({ id: p.forParticipant.id })
            : JSON.stringify({}),
        shortHand: '',
        type: 'PrePick',
        backgroundImage: '',
        info: p.info.value,
        sponsorId: p.sponsor && p.sponsor.id ? p.sponsor.id : 0,
      }

      prePicksGraphQL += `{
        prePickId: 0,
        gameId: "${toPush.gameId}",
        sequence: ${toPush.sequence},
        questionHeader: "${toPush.questionHeader.replace(/"/g, "'")}",
        questionDetail: "${toPush.questionDetail.replace(/"/g, "'")}",
        choiceType: "${toPush.choiceType}",
        choices: "${toPush.choices.replace(/"/g, "'")}",
        points: ${toPush.points},
        tokens: ${toPush.tokens},
        forParticipant: "${toPush.forParticipant.replace(/"/g, "'")}",
        shortHand: "${toPush.shortHand}",
        type: "${toPush.type}",
        backgroundImage: "${toPush.backgroundImage}",
        info: "${toPush.info.replace(/"/g, "'")}",
        sponsorId: ${toPush.sponsorId}
      },`
      prePicks.push(toPush)
    }

    const timeStart = '1980-01-01 ' + this.values.timeStart
    const sportType = this.values.sportType.code
    const subSportGenre = this.values.subSportGenre.code

    const event = {
      gameId: this.values.gameId,
      stage: this.values.stage,
      sportType: sportType,
      subSportGenre: subSportGenre,
      isLeap: this.leap && this.leap.isLeap ? this.leap.isLeap : false,
      leapType: this.values.leapType,
      videoFootageId: this.values.video ? this.values.video.videoFootageId : 0,
      dateStart: this.values.dateStart,
      timeStart: timeStart,
      dateAnnounce: this.values.dateAnnounce,
      datePrePicks: this.values.datePrePicks,
      venue: {
        countryCode: this.values.venue.countryCode,
        stateCode: this.values.venue.state.code,
        city: this.values.venue.city.name,
        latlong: `${this.values.venue.city.lat}, ${this.values.venue.city.long}`,
        stadiumName: this.values.venue.stadiumName,
      },
      participants: participants,
      prePicks: prePicks,
      participantsGraphQL: participantsGraphQL.slice(0, -1),
      prePicksGraphQL: prePicksGraphQL.slice(0, -1),
    }

    return agent.GameEvent.create(event)
      .then(res => {
        if (res) {
          this.leap.gameId = this.values.gameId
          this.values = Object.assign({}, this.values)
          this.unchangedValues = Object.assign({}, this.values)
          this.isUpdating = false
          return Promise.resolve(true)
        }
      })
      .catch(err => {
        CommonStore.setErrorResponse(err.response)
      })
  }

  updateEvent() {
    let prePicksGraphQL = ''

    const prePicksToUpdate = []
    for (let j = 0; j < this.values.prePicks.length; j++) {
      const p = this.values.prePicks[j]
      let _choices = []
      p.choices.forEach(item => {
        item.name
        _choices.push({ id: item.id, value: item.name || item.value })
      })

      const toPush = {
        prePickId: 0,
        gameId: this.values.gameId,
        sequence: parseInt(j + 1),
        questionHeader: JSON.stringify({
          value: p.questionHeader,
          color: '#22ba2c',
        }).replace(/"/g, "'"),
        questionDetail: JSON.stringify([
          { sequence: 1, value: p.questionDetail, color: '#22ba2c' },
        ]).replace(/"/g, "'"),
        choiceType: p.choiceType,
        choices: JSON.stringify(_choices).replace(/"/g, "'"),
        points: 2000,
        tokens: 50,
        forParticipant:
          p.forParticipant && Object.keys(p.forParticipant).length > 0
            ? JSON.stringify({ id: p.forParticipant.id }).replace(/"/g, "'")
            : JSON.stringify({}).replace(/"/g, "'"),
        shortHand: '',
        type: 'PrePick',
        backgroundImage: '',
        info: p.info.value.replace(/"/g, "'"),
        sponsorId:
          p.sponsor && p.sponsor.sponsorItem && p.sponsor.sponsorItem.brandId
            ? p.sponsor.sponsorItem.brandId
            : 0,
      }

      prePicksToUpdate.push(toPush)

      // prePicksGraphQL += `{
      //   prePickId: 0,
      //   gameId: "${toPush.gameId}",
      //   sequence: ${toPush.sequence},
      //   questionHeader: "${toPush.questionHeader.replace(/"/g, '\'')}",
      //   questionDetail: "${toPush.questionDetail.replace(/"/g, '\'')}",
      //   choiceType: "${toPush.choiceType}",
      //   choices: "${toPush.choices.replace(/"/g, '\'')}",
      //   points: ${toPush.points},
      //   tokens: ${toPush.tokens},
      //   forParticipant: "${toPush.forParticipant.replace(/"/g, '\'')}",
      //   shortHand: "${toPush.shortHand}",
      //   type: "${toPush.type}",
      //   backgroundImage: "${toPush.backgroundImage}",
      //   info: "${toPush.info.replace(/"/g, '\'')}",
      //   sponsorId: ${toPush.sponsorId}
      // },`
    }

    const timeStart = '1980-01-01 ' + this.values.timeStart

    const event = {
      gameId: this.values.gameId,
      stage: this.values.stage,
      timeStart: timeStart,
      dateStart: this.values.dateStart,
      dateAnnounce: this.values.dateAnnounce,
      datePrePicks: this.values.datePrePicks,
      countryCode: this.values.venue.countryCode,
      stateCode: this.values.venue.state.code,
      city: this.values.venue.city.name,
      latlong: `${this.values.venue.city.lat}, ${this.values.venue.city.long}`,
      stadium: this.values.venue.stadiumName,
      prePicks: prePicksToUpdate,
    }

    return agent.GameEvent.update(event)
      .then(res => {
        if (res) {
          this.values = Object.assign({}, this.values)
          this.unchangedValues = Object.assign({}, this.values)
          this.isUpdating = false
          return Promise.resolve(true)
        }
      })
      .catch(err => {
        CommonStore.setErrorResponse(err.response)
      })
  }

  //TO BE DELETED
  updateEventGraphQL_DELETE() {
    let prePicksGraphQL = ''

    for (let j = 0; j < this.values.prePicks.length; j++) {
      const p = this.values.prePicks[j]
      // const _qSplit = p.question.split(',')
      // const header = _qSplit[0]
      // const detail = _qSplit.length > 1 ? _qSplit[1] : ''

      let _choices = []
      p.choices.forEach(item => {
        item.name
        _choices.push({ id: item.id, value: item.name || item.value })
      })

      const toPush = {
        gameId: this.values.gameId,
        sequence: parseInt(j + 1),
        questionHeader: JSON.stringify({
          value: p.questionHeader,
          color: '#22ba2c',
        }),
        questionDetail: JSON.stringify([
          { sequence: 1, value: p.questionDetail, color: '#22ba2c' },
        ]),
        choiceType: p.choiceType,
        choices: JSON.stringify(_choices),
        points: 2000,
        tokens: 50,
        forParticipant:
          p.forParticipant && Object.keys(p.forParticipant).length > 0
            ? JSON.stringify({ id: p.forParticipant.id })
            : JSON.stringify({}),
        shortHand: '',
        type: 'PrePick',
        backgroundImage: '',
        info: p.info.value,
        sponsorId: p.sponsor && p.sponsor.id ? p.sponsor.id : 0,
      }

      prePicksGraphQL += `{
        prePickId: 0,
        gameId: "${toPush.gameId}",
        sequence: ${toPush.sequence},
        questionHeader: "${toPush.questionHeader.replace(/"/g, "'")}",
        questionDetail: "${toPush.questionDetail.replace(/"/g, "'")}",
        choiceType: "${toPush.choiceType}",
        choices: "${toPush.choices.replace(/"/g, "'")}",
        points: ${toPush.points},
        tokens: ${toPush.tokens},
        forParticipant: "${toPush.forParticipant.replace(/"/g, "'")}",
        shortHand: "${toPush.shortHand}",
        type: "${toPush.type}",
        backgroundImage: "${toPush.backgroundImage}",
        info: "${toPush.info.replace(/"/g, "'")}",
        sponsorId: ${toPush.sponsorId}
      },`
    }

    const timeStart = '1980-01-01 ' + this.values.timeStart

    const event = {
      gameId: this.values.gameId,
      stage: this.values.stage,
      timeStart: timeStart,
      dateStart: this.values.dateStart,
      dateAnnounce: this.values.dateAnnounce,
      datePrePicks: this.values.datePrePicks,
      venue: {
        countryCode: this.values.venue.countryCode,
        stateCode: this.values.venue.state.code,
        city: this.values.venue.city.name,
        latlong: `${this.values.venue.city.lat}, ${this.values.venue.city.long}`,
        stadiumName: this.values.venue.stadiumName,
      },
      prePicksGraphQL: prePicksGraphQL.slice(0, -1),
    }

    return agent.GameEvent.update(event)
      .then(res => {
        if (res) {
          this.values = Object.assign({}, this.values)
          this.unchangedValues = Object.assign({}, this.values)
          this.isUpdating = false
          return Promise.resolve(true)
        }
      })
      .catch(err => {
        CommonStore.setErrorResponse(err.response)
      })
  }

  readCitiesByState(stateCode) {
    return agent.GameEvent.readCitiesByState(stateCode)
      .then(data => {
        this.cities = data.data
        return Promise.resolve(this.cities)
      })
      .catch(err => {
        return Promise.resolve([])
      })
  }

  @action
  getEventByGameId(key, gameId) {
    return agent.Storage.getEventByGameId(key, gameId)
  }

  @observable
  activeSlidingItem = null
  @action
  setActiveSlidingItem(val) {
    this.activeSlidingItem = val
  }
  @action
  resetActiveSlidingItem() {
    this.activeSlidingItem = null
  }

  /*
  @observable
  isLeap = false
  @action
  setLeap(val) {
    this.isLeap = val
  }
*/

  @observable
  leap = {
    gameId: null,
    isLeap: false,
    leapType: '',
    video: null,
  }

  @action
  resetLeap() {
    this.leap = {
      gameId: null,
      isLeap: false,
      leapType: '',
      video: null,
    }
  }

  @observable
  isLeapUpdating = false

  @action
  updateLeap() {
    this.isLeapUpdating = true
    return agent.GameEvent.updateLeap({
      gameId: this.leap.gameId,
      isLeap: this.leap.isLeap,
      leapType: this.leap.leapType,
    })
      .then(next => {
        if (next) {
          //TODO:
          this.values.isLeap = this.leap.isLeap
          this.unchangedValues.isLeap = this.leap.isLeap
          return Promise.resolve(next)
        }
      })
      .catch(err => {
        CommonStore.setErrorResponse(err.response)
        this.isLeapUpdating = false
      })
      .finally(_ => {
        this.isLeapUpdating = false
      })
  }

  recordedGames = []

  @action
  getRecordedGames(args) {
    this.isLoading = true
    return agent.GameEvent.readRecordedGames(args)
      .then(data => {
        this.recordedGames = data.data.data.readRecordedGames
      })
      .finally(_ => {
        this.isLoading = false
      })
  }

  videos = []
  @action
  getVideoFootage(args) {
    this.isLoading = true
    return agent.GameEvent.readVideoFootages()
      .then(data => {
        if (
          data &&
          data.data &&
          data.data.data &&
          Array.isArray(data.data.data)
        ) {
          data.data.data.forEach(async v => {
            v.participants = await JSON.parse(
              JSON.parse(JSON.stringify(v.participants.replace(/'/g, '"')))
            )
          })
        }
        this.videos = data.data.data
      })
      .finally(_ => {
        this.isLoading = false
      })
  }

  @observable
  updatedGame = null
  @action
  setUpdatedGame(data) {
    this.updatedGame = data
  }

  @action
  accessHComm(item) {
    const info = {
      gameId: item.gameId,
      username: OperatorStore.operator.username,
      password: 'SportocoToday.v1',
      isLeap: item.isLeap,
      sportType: item.sportType,
      subSportGenre: item.subSportGenre,
      executionType: !item.leapType
        ? 'normal'
        : item.leapType === 'recording'
        ? item.dateEndSession && new Date() > new Date(item.dateEndSession)
          ? 'automation'
          : 'recording'
        : 'normal',
    }

    const key = crypto.createCipher('aes-128-cbc', config.SALT)

    let ciphertext = key.update(JSON.stringify(info), 'utf8', 'hex')
    ciphertext += key.final('hex')

    const url = `${config.PROTOCOL}://${config.HOST_COMMAND_URL}:${
      config.HOST_COMMAND_PORT
    }/?info=${ciphertext}${
      'automation' === info.executionType ? '&headless=true' : ''
    }`
    window.open(url, '_blank')
  }

  viewRecordedEvent(item) {
    const info = {
      gameId: item.gameId,
      username: OperatorStore.operator.username,
      password: 'SportocoToday.v1',
      isLeap: item.isLeap,
      executionType: 'recorded',
      isViewRecordedEvent: true,
      isRecordEnded: true,
    }
    const key = crypto.createCipher('aes-128-cbc', config.SALT)
    let ciphertext = key.update(JSON.stringify(info), 'utf8', 'hex')
    ciphertext += key.final('hex')
    const url = `${config.PROTOCOL}://${config.HOST_COMMAND_URL}:${config.HOST_COMMAND_PORT}/?info=${ciphertext}`
    window.open(url, '_blank')
  }

  @action
  isSiteOnline(url, callback) {
    // try to load favicon
    const timer = setTimeout(function() {
      // timeout after 5 seconds
      callback(false)
    }, 5000)

    const img = document.createElement('img')
    img.onload = function() {
      clearTimeout(timer)
      callback(true)
    }

    img.onerror = function() {
      clearTimeout(timer)
      callback(false)
    }

    img.src = url + '/favicon.ico'
  }

  async getSelectedSponsor(_sponsorId) {
    const _sponsor = { sponsorCategory: null, sponsorItem: null }
    _sponsor.sponsorCategory = await PrePlayStore.sponsors.filter(cat => {
      return cat.brands.filter(brand => {
        return brand.brandId === _sponsorId
      })[0]
    })[0]
    _sponsor.sponsorItem =
      (await _sponsor.sponsorCategory) && _sponsor.sponsorCategory.brands
        ? _sponsor.sponsorCategory.brands.filter(
            o => o.brandId === _sponsorId
          )[0]
        : null

    return _sponsor
  }

  @action
  getGamePlaysByGameId(args) {
    return agent.GameEvent.getGamePlaysByGameId(args)
  }

  @action
  importPlaystack(args) {
    return agent.GameEvent.importPlaystack(args)
  }

  @observable
  prePickPresets = []

  @action
  getPrePickPresets(args) {
    return new Promise(resolve => {
      agent.GameEvent.getPrePickPresets(args)
        .then(async response => {
          console.log(
            'RAW PREPICK PRESETS',
            JSON.parse(JSON.stringify(response.data.data))
          )
          if (
            response &&
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data)
          ) {
            for (let a = 0; a < response.data.data.length; a++) {
              const preset = response.data.data[a]
              try {
                preset.choices = await JSON.parse(
                  JSON.parse(JSON.stringify(preset.choices))
                )
                if (preset.choices && Array.isArray(preset.choices)) {
                  preset.choices.forEach(choice => {
                    delete Object.assign(choice, {
                      ['id']: choice['sequence'],
                    })['sequence']
                  })
                }
              } catch (e) {
                const _participantsExists = preset.choices
                  .toString()
                  .match(new RegExp('participant', 'gi'))
                if (_participantsExists && _participantsExists.length > 1) {
                  const _participants = preset.choices
                    .substring(1, preset.choices.length - 1)
                    .split(',')
                  if (_participants && _participants.length > 0) {
                    const _newChoices = []
                    _participants.map(async (item, i) => {
                      const _par = await this.values.participants[i]
                      if (_par) {
                        _newChoices.push(_par)
                      }
                    })
                    preset.choices = _newChoices
                  }
                }
              }

              for (let i = 0; i < this.values.participants.length; i++) {
                const participant = this.values.participants[i]
                const _detail_with_participant = preset.question_detail
                  .toLowerCase()
                  .indexOf('participant[' + i + '].name')
                if (_detail_with_participant > -1) {
                  preset.question_detail = await preset.question_detail
                    .toLowerCase()
                    .replace('participant[' + i + '].name', participant.name)
                  if ('multi' === preset.choice_type) {
                    preset.forParticipant = participant
                  }
                }
              }

              preset.question = ''
              const _infoValue = preset.info
                .toString()
                .replace(/(<([^>]+)>)/gi, '')
              preset.info = {
                value: _infoValue
                  ? `<p><span class="ql-font-pamainbold" style="color: rgb(0, 0, 0);">${_infoValue}</span></p>`
                  : '',
                font: 'pamainbold',
                color: '#000000',
              }
              delete Object.assign(preset, {
                ['choiceType']: preset['choice_type'],
              })['choice_type']
              delete Object.assign(preset, {
                ['questionHeader']: preset['question_header'],
              })['question_header']
              delete Object.assign(preset, {
                ['questionDetail']: preset['question_detail'],
              })['question_detail']
              delete Object.assign(preset, {
                ['shortHand']: preset['shorthand'],
              })['shorthand']

              preset.sponsor = await this.getSelectedSponsor(preset.sponsor_id)
            }

            console.log('PARSED PREPICK PRESETS', response.data.data)

            this.prePickPresets = response.data.data
          }
        })
        .catch(err => {
          console.log(err)
          if (err.toString().includes('401')) {
            CommonStore.setErrorResponse({ statusText: 'unauthorized' })
          }
        })
        .finally(_ => {
          return resolve(true)
        })
    })
  }

  @action
  getSponsorsBySportType(args) {
    agent.GameEvent.getSponsorsBySportType(args).then(async response => {
      PrePlayStore.sponsors = await this.extractSponsors(response.data.data)
    })
  }

  //////////////////////STARTING FROM HERE - NOT INCLUDED ///////////////////////////////////////////////////////////////////
  //NOT INCLUDED
  //TO BE DELETED
  tempCounter = 1

  @action
  resetTempCounter() {
    this.tempCounter = 1
  }
}

export default new GameEventStore()
