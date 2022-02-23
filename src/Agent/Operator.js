import axios from 'axios'
import config from '@/Agent/config'
import { JWTToken } from '@/utils'

// module.exports = requests => {
//   return {
//     current: () => requests.get('/user'),
//     login: (email, password) =>
//       requests.post('/users/login', { user: { email, password } }),
//     register: (username, email, password) =>
//       requests.post('/users', { user: { username, email, password } }),
//     save: user => requests.put('/user', { user }),
//   }
// }

const URL = `${config.PROTOCOL}://${config.URL}:${config.PORT}`

const logingraphql = args => {
  const params = {
    query: `
      query {
        loginAdminUser(username: "${args.username}", password: "${args.password}")
        {
          username
          id
          groupId
          firstName
          lastName
          email
          accessGameAdmin
          accessHostCommand
          token
        }
      }
    `,
  }

  return axios.post(`${URL}/operator`, params, {
    headers: { 'Content-Type': 'application/json' },
  })
}

const login = args => {
  return axios({
    method: 'POST',
    url: `${URL}/operator/login`,
    data: args,
    headers: { 'Content-Type': 'application/json' },
  })
}

const checkLoggedIn = args => {
  return axios({
    method: 'GET',
    url: `${URL}/restful_operator/check_logged_in/${args.id}/${args.username}`,
    headers: {
      Authorization: `Bearer ${JWTToken()}`,
      'Content-Type': 'application/json',
    },
  })
}

module.exports = {
  login,
  checkLoggedIn,
}
