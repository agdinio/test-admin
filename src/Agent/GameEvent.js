import axios from 'axios'
import { JWTToken } from '@/utils'
import NavigationStore from '@/stores/NavigationStore'
import config from '@/Agent/config'

/*
const getUsers = () => {
  return axios.get('http://console.sportsontheweb.net/api/read.php')
}

const setUser = (user) => {
  return axios.post('http://console.sportsontheweb.net/api/create.php', user)
}
*/

const URL = `${config.PROTOCOL}://${config.URL}:${config.PORT}`

//////////////////////////////////////////////// START GRAPHQL ///////////////////////////////////////////////////////////

const readGameEventInfo = args => {
  /*
  const params = {
    query: `
      query {
          readGameEventInfo {
            states {
              code
              name
            },
            sportTypes {
              id
              name
              code
              icon
              subSportGenres {
                name
                code
              }
            },
            seasons {
              name
              code
            }
          }
        }
    `
  }

  return axios.post(`${URL}/gameEventInfo`, params, {headers: {'Authorization':`Bearer ${JWTToken()}`, 'Content-Type':'application/json'}})
*/
  // return axios.get(`${URL}/game/game_event_info`, {
  //   headers: {
  //     Authorization: `Bearer ${JWTToken()}`,
  //     'Content-Type': 'application/json',
  //   },
  // })

  return axios({
    method: 'GET',
    url: `${URL}/game/game_event_info`,
    params: args,
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const readStates = () => {
  const params = {
    query: `
      query {
        readStates {
          code
          name
        }
      }
    `,
  }

  return axios.post(`${URL}/states`, params, {
    headers: { 'Content-Type': 'application/json' },
  })
}

const readCitiesByState = stateCode => {
  /*
  const params = {
    query: `
      query {
        readCitiesByState(stateCode: "${stateCode}") {
          name
          lat
          long
        }
      }
    `
  }

  return axios.post(`${URL}/cities`, params, {headers: {'Content-Type':'application/json'}})
*/
  return axios.get(
    `${URL}/common/read_cities_by_state`,
    { params: { stateCode: stateCode } },
    { headers: { 'Content-Type': 'application/json' } }
  )
}

const readBySportType = sportType => {
  /*
  const params = {
    query: `
      query {
        readGames(sportType: "${sportType}")
        {
          gameId
          stage
          sportType
          subSportGenre
          isLeap
          leapType
          videoFootageId
          videoFootageName
          videoFootagePath
          formattedTimeStart
          timeStart
          dateStart
          dateAnnounce
          datePrePicks
          countryCode
          stateCode
          stateName
          city
          latlong
          stadium
          dateStartSession
          dateEndSession
          participants {
            gameId
            sequence
            initial
            score
            name
            topColor
            bottomColor
          }
          prePicks {
            prePickId
            gameId
            sequence
            questionHeader
            questionDetail
            choiceType
            choices
            points
            tokens
            forParticipant
            shortHand
            type
            backgroundImage
            info
            sponsorId
          }
        }
      }
    `
  }

  return axios.post(`${URL}/games`, params, {headers: {'Authorization':`Bearer ${JWTToken()}`, 'Content-Type':'application/json'}})
*/
  return axios.get(
    `${URL}/game/read_games`,
    { params: { sportType: sportType } },
    {
      headers: {
        Authorization: `Bearer ${JWTToken()}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

const readGameEvents = args => {
  /*
  const params = {
    query: `
      query {
        readGameEvents(sportType: "${args.sportType}", subSportGenre: "${args.subSportGenre}")
        {
          gameId
          stage
          sportType
          subSportGenre
          isLeap
          leapType
          videoFootageId
          videoFootageName
          videoFootagePath
          formattedTimeStart
          timeStart
          dateStart
          dateAnnounce
          datePrePicks
          countryCode
          stateCode
          stateName
          city
          latlong
          stadium
          dateStartSession
          dateEndSession
          participants {
            gameId
            sequence
            initial
            score
            name
            topColor
            bottomColor
          }
          prePicks {
            prePickId
            gameId
            sequence
            questionHeader
            questionDetail
            choiceType
            choices
            points
            tokens
            forParticipant
            shortHand
            type
            backgroundImage
            info
            sponsorId
          }
        }
      }
    `
  }

*/

  return axios({
    method: 'GET',
    url: `${URL}/game/read_game_events`,
    params: args,
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const readGameById = gameId => {
  /*
  const params = {
    query: `
      query {
        readGameById(gameId: "${gameId}") {
          gameId
          stage
          sportType
          subSportGenre
          isLeap
          leapType
          videoFootageId
          videoFootageName
          videoFootagePath
          formattedTimeStart
          timeStart
          dateStart
          dateAnnounce
          datePrePicks
          countryCode
          stateCode
          stateName
          city
          latlong
          stadium
          dateStartSession
          dateEndSession
          participants {
            participantId
            gameId
            sequence
            initial
            score
            name
            topColor
            bottomColor
          }
          prePicks {
            prePickId
            gameId
            sequence
            questionHeader
            questionDetail
            choiceType
            choices
            points
            tokens
            forParticipant
            shortHand
            type
            backgroundImage
            info
            sponsorId
          }
        }
      }
    `
  }

  return axios.post(`${URL}/games`, params, {headers: {'Authorization':`Bearer ${JWTToken()}`, 'Content-Type':'application/json'}})
*/
  return axios({
    method: 'GET',
    url: `${URL}/game/read_game_by_id`,
    params: { gameId: gameId },
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const create = args => {
  /*
  const params = {
    query: `
      mutation {
        createGame(gameId: "${args.gameId}",
                  stage: "${args.stage}",
                  sportType: "${args.sportType}",
                  subSportGenre: "${args.subSportGenre}",
                  isLeap: ${args.isLeap},
                  leapType: "${args.leapType}",
                  videoFootageId: ${args.videoFootageId},
                  timeStart: "${args.timeStart}",
                  dateStart: "${args.dateStart}",
                  dateAnnounce: "${args.dateAnnounce}",
                  datePrePicks: "${args.datePrePicks}",
                  countryCode: "${args.venue.countryCode}",
                  stateCode: "${args.venue.stateCode}",
                  city: "${args.venue.city}",
                  latlong: "${args.venue.latlong}",
                  stadium: "${args.venue.stadiumName}",
                  participants: [${args.participantsGraphQL}],
                  prePicks: [${args.prePicksGraphQL}])
        {
          gameId
          stage
          sportType
          subSportGenre
        }
      }
    `
  }

  return axios.post(`${URL}/games`, params, {headers: {'Authorization':`Bearer ${JWTToken()}`, 'Content-Type':'application/json'}})
*/
  return axios({
    method: 'POST',
    url: `${URL}/game/create_game`,
    data: args,
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const update = args => {
  /*
  const params = {
    query: `
      mutation {
        updateGame(gameId: "${args.gameId}",
                  stage: "${args.stage}",
                  timeStart: "${args.timeStart}",
                  dateStart: "${args.dateStart}",
                  dateAnnounce: "${args.dateAnnounce}",
                  datePrePicks: "${args.datePrePicks}",
                  countryCode: "${args.venue.countryCode}",
                  stateCode: "${args.venue.stateCode}",
                  city: "${args.venue.city}",
                  latlong: "${args.venue.latlong}",
                  stadium: "${args.venue.stadiumName}",
                  prePicks: [${args.prePicksGraphQL}])
      }
    `
  }

  return axios.post(`${URL}/games`, params, {headers: {'Authorization':`Bearer ${JWTToken()}`, 'Content-Type':'application/json'}})
*/

  return axios({
    method: 'POST',
    url: `${URL}/game/update_game`,
    data: args,
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const deleteGame = gameId => {
  /*
  const params = {
    query: `
      mutation {
        deleteGame(gameId: "${gameId}")
      }
    `,
  }
  return axios.post(`${URL}/games`, params, {
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
*/

  return axios({
    method: 'POST',
    url: `${URL}/game/delete_game`,
    data: { gameId: gameId },
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const updateLeap = args => {
  const params = {
    query: `
      mutation {
        updateLeap(gameId: "${args.gameId}", isLeap: ${args.isLeap}, leapType: "${args.leapType}")
      }
    `,
  }

  return axios.post(`${URL}/games`, params, {
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const readRecordedGames = args => {
  const params = {
    query: `
      query {
        readRecordedGames
        {
          gameId
          stage
          sportType
          subSportGenre
          isLeap
          leapType
          videoFootageId
          videoFootageName
          videoFootagePath
          formattedTimeStart
          timeStart
          dateStart
          dateAnnounce
          datePrePicks
          countryCode
          stateCode
          stateName
          city
          latlong
          stadium
          participants {
            gameId
            sequence
            initial
            score
            name
            topColor
            bottomColor
          }
        }
      }
    `,
  }

  return axios.post(`${URL}/games`, params, {
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const readVideoFootages = args => {
  // const params = {
  //   query: `
  //     query {
  //       readVideoFootages
  //       {
  //         videoFootageId
  //         videoFootageName
  //         videoFootagePath
  //       }
  //     }
  //   `,
  // }
  //
  // return axios.post(`${URL}/games`, params, {
  //   headers: {
  //     Authorization: `Bearer ${JWTToken()}`,
  //     'Content-Type': 'application/json',
  //   },
  // })

  return axios({
    method: 'GET',
    url: `${URL}/game/read_video_footages`,
    params: args,
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const getGamePlaysByGameId = args => {
  return axios.get(
    `${URL}/game/read_playstack`,
    { params: args },
    {
      headers: {
        Authorization: `Bearer ${JWTToken()}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

const importPlaystack = args => {
  return axios.post(`${URL}/game/import_playstack/`, args, {
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

const getPrePickPresets = args => {
  return axios({
    method: 'GET',
    url: `${URL}/game/read_prepick_presets`,
    params: args,
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })

  // return axios.get(
  //   `${URL}/game/read_prepick_presets`,
  //   { params: args },
  //   {
  //     headers: {
  //       Authorization: `Bearer ${JWTToken()}`,
  //       'Content-Type': 'application/json',
  //     },
  //   }
  // )
}

const getSponsorsBySportType = args => {
  return axios({
    method: 'GET',
    url: `${URL}/game/read_sponsors_by_sport_type`,
    params: args,
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

//////////////////////////////////////////////// END GRAPHQL ///////////////////////////////////////////////////////////

const toStringLiteral = obj => {
  var str = JSON.stringify(obj, 0, 4),
    arr = str.match(/".*?":/g)

  for (var i = 0; i < arr.length; i++) {
    str = str.replace(arr[i], arr[i].replace(/"/g, ''))
  }

  return str
}

const pull = param => {
  return new Promise(resolve => {
    if (param) {
      axios
        .get(`${URL}/events/list/${param}`, {
          headers: {
            Authorization: `Bearer ${JWTToken()}`,
            'Content-Type': 'application/json',
          },
        })
        .then(res => {
          if (res.data.error && res.data.message === 'unauthorized') {
            NavigationStore.setCurrentView('/unauthorized')
          } else {
            resolve(res.data)
          }
        })
    } else {
      axios
        .get(`${URL}/events/list`, {
          headers: {
            Authorization: `Bearer ${JWTToken()}`,
            'Content-Type': 'application/json',
          },
        })
        .then(res => {
          if (res.data.error && res.data.message === 'unauthorized') {
            NavigationStore.setCurrentView('/unauthorized')
          } else {
            resolve(res.data)
          }
        })
    }
  })
}

const patch = params => {
  return axios.patch(`${URL}/events/${params.eventId}`, params, {
    headers: { 'Content-Type': 'application/json' },
  })
}

module.exports = {
  readGameEventInfo,
  readStates,
  readCitiesByState,
  create,
  update,
  readBySportType,
  readGameById,
  patch,
  pull,
  deleteGame,
  updateLeap,
  readRecordedGames,
  readVideoFootages,
  readGameEvents,
  getGamePlaysByGameId,
  importPlaystack,
  getPrePickPresets,
  getSponsorsBySportType,
}
