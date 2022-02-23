import axios from 'axios'
import config from '@/Agent/config'
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

const URL = config.DEV_URL

const login = (params) => {
  return axios.post(`${URL}/operators/signin`, params)
}

module.exports = {
  login,
}
