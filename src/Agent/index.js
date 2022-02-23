import superagent from 'superagent'
import PlayFab, { registerUser, login, checkPlayerToken } from '@/Agent/PlayFab'
import * as Server from '@/Agent/Server'
import IntroScreen from '@/Agent/IntroScreen'
import PrePick from '@/Agent/PrePick'
import Auth from '@/Agent/Auth'
import * as GameServer from '@/Agent/GameServer'
import GameEvent from '@/Agent/GameEvent'
import * as Storage from '@/Agent/Storage'
import Operator from '@/Agent/Operator'

export default {
  //Auth: Auth(PlayFab),
  Auth,
  PlayFab,
  Server,
  IntroScreen,
  PrePick,
  registerUser,
  login,
  checkPlayerToken,
  GameServer,
  GameEvent,
  Storage,
  Operator,
  URL,
}
