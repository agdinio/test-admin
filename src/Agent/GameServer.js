import util from 'util'
import socketCluster from 'socketcluster-client'
import PlayStore from '@/stores/PlayStore'
import GameEventStore from '@/stores/GameEventStore'
import config from '@/Agent/config'

let socket = null
let currentManagedGame = {}
let currentManagedGameInfo = {}
let isDatabaseResettingFromLocal = false
let showDatabaseResetLoader = false
const anyTypes = 'liveplay1x, gamemaster, sponsorplay, prizeplay, announce'

// Used to establish connection with Ambassador Server
// hostname will need to be changed when the Server is
//    running somewhere else besides localhost
// TODO: Hardcode live connection string
const connectOptions = {
  hostname: config.URL,
  port: config.PORT,
  path: '/socketcluster',
  autoReconnectOptions: {
    initialDelay: 6000,
    randomness: 10000,
    multiplier: 1.5,
    maxDelay: 60000,
  },
}

//------------------------------------------------------------------------
const debug = obj => {
  return console.log(util.inspect(obj, { depth: null }))
}

//------------------------------------------------------------------------

const connect = () => {
  if (socket == null) {
    socket = socketCluster.create(connectOptions)

    socket.on('subscribeFail', function(channelname) {
      console.log(
        '[Server Socket] Failed to Subscribe to Channel:' + channelname
      )
    })

    socket.on('connect', status => {
      console.log('Game Server is connected')
      // Add code here to check if authenticated
      if (status.isAuthenticated) {
        console.log('connection status:')
        debug(status)
      } else {
        console.log('client not authenticated:')
        debug(status)
      }

      let gameStageChannel = socket.subscribe('admin.game.update')
      gameStageChannel.watch(params => {
        GameEventStore.setUpdatedGame(params)
      })
    })

    socket.on('close', _ => {
      console.log(`[Server Socket] Socket has closed`)
      // if (currentManagedGame['hostGameChannel']) {
      //   //currentManagedGame['hostGameChannel'].unwatch(hostGameChannelWatcher)
      //   socket.destroyChannel(currentManagedGame['hostGameChannel'].name)
      // }
    })
  }
}

export function send(channel, data) {
  return new Promise((resolve, reject) => {
    connect()
    console.log(`[Server Send : ${channel}]`)
    socket.emit(channel, data, (response, err) => {
      if (err) {
        PlayStore.showErrorPage(err)
      }
      if (response) {
        if (response.success) {
          return resolve(response.response)
        } else {
          return reject(response)
        }
      }
    })
  })
}

export function receive(channel) {
  return new Promise((resolve, reject) => {
    console.log(`[Server Receive]`)
    socket.on(channel, response => {
      return resolve(response)
    })
  })
}

export const broadcastPlay = type => {
  return send('games.changeplay', type)
}

export const broadcastLockout = val => {
  return send('games.lockplay', val)
}

export const endPlay = val => {
  return send('games.endplay', val)
}

export const changeNextPlay = val => {
  return send('games.changenextplay', val)
}

export const showResult = val => {
  return send('games.result', val)
}

export const broadcastResolvePending = val => {
  return send('games.resolve', val)
}

export const announcement = val => {
  return send('games.announcement', val)
}

export const typeList = () => {
  return send('games.typelist', {})
}

export const activeGame = args => {
  return send('games.active', args)
}

//*************************************************** PLAYSTORE ********************************************************

const promiseChain = tasks => {
  return tasks.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask.then(currentResult => [...chainResults, currentResult])
    )
  }, Promise.resolve([]))
}

export const resetDatabase = () => {
  isDatabaseResettingFromLocal = true
  return send('games.resetdb', {})
}

export const resetDatabasex = () => {
  let gameIds = []
  return send('games.info', {})
    .then(games => {
      gameIds = games.map(g => g.id)
      let playIds = []
      games.forEach(g => {
        // console.log('resetDatabase plays', g.id, g.plays)
        const newPlayIds = Object.keys(g.playStack.stack)
        playIds = playIds.concat(newPlayIds)
      })
      const playTasks = []
      playIds.forEach(p => {
        playTasks.push(send('games.delete', { entityType: 'Play', id: p }))
      })
      return promiseChain(playTasks)
    })
    .catch(err => {
      console.log('could not delete all plays', err)
    })
    .then(deletePlaysReponse => {
      //console.log('deleted plays reponse', deletePlaysReponse)
      // delete games
      const gameTasks = []
      gameIds.forEach(g => {
        gameTasks.push(send('games.delete', { entityType: 'Game', id: g }))
      })
      return promiseChain(gameTasks)
    })
    .then(deleteGamesReponse => {
      //console.log('deleted games reponse', deleteGamesReponse)
      /*
      if (socket.subscriptions().length > 0) {
        socket.subscriptions().forEach(subs => {
          socket.unsubscribe(subs)
        })
      }
*/
    })
    .catch(err => {
      console.log('could not get games and/or plays', err)
    })
}

export const gamesInfo = args => {
  return send('games.info', args)
}

export const authenticate = args => {
  return send('authentication', args)
}

export const gamesCreateX2 = args => {
  return send('games.create', args)
    .then(response => {
      console.log('initially created game', response.item.id)
      return response.item.id
    })
    .catch(err => {
      console.log(`error in setting up the database ${err}`)
    })
}

export const gamesCreate = args => {
  let testGame
  return send('games.create', args)
    .then(response => {
      console.log('initially created game', response.item.id)
      return send('games.pending', { progress: 'Pending' })
    })
    .then(games => {
      testGame = games[0]
      console.log(`pending games ${games.map(g => g.id)}`)
      return send('games.info', [testGame.id])
    })
    .then(gamesInfo => {
      testGame.playStack = gamesInfo[0].playStack
      return send('games.update', { entityType: 'Game', value: testGame })
    })
    .then(updateResponse => {
      return (testGame = updateResponse.item)
    })
    .catch(err => {
      console.log(`error in setting up the database ${err}`)
    })
}

export const gamesPending = args => {
  return send('games.pending', args)
}

export const gamesUpdate = args => {
  return send('games.update', args)
}

export const gamesUpdatePreset = args => {
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.removeplayfromstack',
    data: { playId: args.playId },
  })
}

export const removePlayFromStack = playId => {
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.removeplayfromstack',
    data: { playId: playId },
  })
}

export const gamesRead = args => {
  return send('games.read', args)
}

export const addThePlay = play => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.addplaytostack',
    data: { play: play },
  })
}

export const gamesGoPlay = playToGo => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.goplay',
    data: { play: playToGo },
  })
}

export const gamesStart = () => {
  connect()
  currentManagedGame['hostGameChannel'].publish(
    { event: 'games.start' },
    err => {
      if (err) {
        console.log('game start failed', err)
      }
    }
  )
}

export const gamesStartPlay = playId => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.startplay',
    data: { playId: playId },
  })
}

export const gamesLockPlay = playId => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.lockplay',
    data: { playId: playId },
  })
}

export const gamesEndPlay = args => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.endplay',
    data: { playId: args.playId, result: args.result },
  })
}

export const gamesConfirmPlay = playId => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.confirmplay',
    data: { playId: playId },
  })
}

export const gamesEndGame = () => {
  connect()
  currentManagedGame['hostGameChannel'].publish(
    { event: 'games.endgame' },
    err => {
      if (err) {
        console.log('game end failed', err)
      } else {
        console.log('game successfully ended')
      }
    }
  )
}

export const movePlayBefore = args => {
  connect()
  currentManagedGame['hostGameChannel'].publish({
    event: 'games.moveplaybefore',
    data: { playId: args.playId, beforeId: args.beforeId },
  })
}

export const manageGame = game => {
  return new Promise(resolve => {
    connect()
    currentManagedGame = game
    currentManagedGame['hostGameChannel'] = socket.subscribe(game.id + '.host')
    establishHostWatchers()
    resolve(currentManagedGame['hostGameChannel'])
  })
}

const establishHostWatchers = () => {
  const hostChannel = currentManagedGame['hostGameChannel']
  if (hostChannel.watchers().length <= 0) {
    hostChannel.on('subscribe', hostGameChannelWatcher)
  }
}

const hostGameChannelWatcher = (data, res) => {
  const hostGameChannel = currentManagedGame['hostGameChannel']
  hostGameChannel.watch(data => {
    switch (data.event) {
      case 'plays.stackupdate':
        console.log('PLAYS.STACKUPDATE', data.data)
        PlayStore.updatePlayStack({
          playStack: data.data.playStack,
          plays: data.data.plays,
        })
        break
      case 'games.update':
        const updatedGame = Object.assign(currentManagedGameInfo, data.data)
        console.log('GAMES.UPDATE', updatedGame)
        //PlayStore.updateGameX1(updatedGame)
        PlayStore.setGame(data.data)
        break
      case 'games.startplay':
        console.log('GAMES.STARTPLAY', PlayStore.game.id, data)
        //PlayStore.updateGame()
        PlayStore.gamesStartPlayNull(data.data)
        break
      case 'games.endplay':
        console.log('GAMES.ENDPLAY', data.data)
        PlayStore.gamesEndPlayResult(data.data)
        break
      case 'plays.update':
        console.log('PLAYS.UPDATE', data.data)
        PlayStore.playUpdate(data.data)
        break
      case 'games.endgame':
        console.log('GAMES.ENDGAME')
        PlayStore.gamesEndGameWatch()
        break
      case 'database.reset':
        console.log('DATABASE.RESET', data.data)
        if (!isDatabaseResettingFromLocal) {
          PlayStore.setShowDatabaseResetLoader(true)
        }
        break
      default:
        if (
          [
            'games.prepickstart',
            'games.ready',
            'games.start',
            'games.endplay',
            'games.addplaytostack',
            'games.removeplayfromstack',
            'games.goplay',
            'games.lockplay',
            'games.confirmplay',
            'games.moveplaybefore',
          ].indexOf(data.event) < 0
        ) {
          // missing implementation
          console.log('unimplemented event', data)
        }
    }
  })

  console.log('SUBSCRIBED', currentManagedGame['hostGameChannel'])
}

export const connectSC = () => {
  connect()
}
