import { observable, action, computed, reaction } from 'mobx'
import agent from '@/Agent'
import { StoreJWTToken } from '@/utils'
import moment from 'moment-timezone'
import NavigationStore from '@/stores/NavigationStore'
import CommonStore from '@/stores/CommonStore'

class OperatorStore {
  @observable
  auth = {
    username: '',
    password: '',
  }

  operator = {
    username: '',
    id: 0,
    groupId: 0,
    groupName: '',
    firstName: '',
    lastName: '',
    email: '',
    access: {
      gameAdmin: false,
      hostCommand: false,
    },
  }

  @action
  login() {
    return agent.Operator.login({
      username: this.auth.username,
      password: this.auth.password,
    })
      .then(response => {
        if (response && response.data.data) {
          this.operator.username = response.data.data.username
          this.operator.id = response.data.data.id
          this.operator.groupId = response.data.data.groupId
          this.operator.groupName = response.data.data.groupName
          this.operator.firstName = response.data.data.firstName
          this.operator.lastName = response.data.data.lastName
          this.operator.email = response.data.data.email
          this.operator.access = response.data.data.access
          this.operator.expiresIn = new Date(
            moment(new Date()).add(1, 'd')
          ).getTime()
          this.operator.location = ''

          StoreJWTToken(response.data.data.token)
          localStorage.setItem('OPERATOR', JSON.stringify(this.operator))
          return Promise.resolve(true)
        } else {
          return Promise.resolve(false)
        }
      })
      .catch(err => {
        return Promise.resolve(false)
      })
  }

  @action
  checkLoggedIn() {
    debugger
    let credential = localStorage.getItem('OPERATOR')
    if (credential) {
      credential = JSON.parse(credential)
      if (new Date().getTime() > credential.expiresIn) {
        localStorage.removeItem('OPERATOR')
        NavigationStore.setCurrentView('/login')
      } else {
        this.operator = credential
        NavigationStore.setCurrentView(credential.location)
      }
    } else {
      localStorage.removeItem('OPERATOR')
      NavigationStore.setCurrentView('/login')
    }
  }

  updateLoggedIn(loc) {
    debugger
    let credential = localStorage.getItem('OPERATOR')
    if (credential) {
      credential = JSON.parse(credential)
      if (new Date().getTime() < credential.expiresIn) {
        credential.location = loc
        localStorage.setItem('OPERATOR', JSON.stringify(credential))
      } else {
        CommonStore.setErrorResponse({ statusText: 'unauthorized' })
      }
    }
  }

  @action
  checkLoggedIn2() {
    return new Promise(resolve => {
      let credential = localStorage.getItem('OPERATOR')
      if (credential) {
        credential = JSON.parse(credential)
        if (new Date().getTime() > credential.expiresIn) {
          localStorage.removeItem('OPERATOR')
          return resolve()
        } else {
          return resolve(credential.location)
        }
      } else {
        return resolve()
      }
    })
  }

  @action
  checkLoggedInTODELETE() {
    return new Promise(resolve => {
      if (this.operator.id) {
        return resolve(true)
      } else {
        let credential = localStorage.getItem('OPERATOR')
        if (credential) {
          credential = JSON.parse(credential)
          if (new Date().getTime() > credential.expiresIn) {
            localStorage.removeItem('OPERATOR')
            return false
          } else {
            agent.Operator.checkLoggedIn({
              id: credential.id,
              username: credential.username,
            })
              .then(data => {
                console.log('>>>>>>>>>>>>', data.data.data)
                if (data.data.data.id && data.data.data.username) {
                  return resolve(true)
                } else {
                  return resolve(false)
                }
              })
              .catch(err => {
                console.log('>>>>>>>>>>>>', err.response)
                return resolve(false)
              })
          }
        } else {
          return resolve(false)
        }
      }
    })
  }
}

export default new OperatorStore()
