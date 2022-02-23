module.exports = {
  SECURE_PROTOCOL: 'https',
  PROTOCOL: 'http',
  // URL: 'sportocotoday.com',
  URL: 'localhost',
  PORT: 6604,
  SALT: 'Sportoco',
  IMAGE_FOLDER: 'image',
  AUTOMATION_PORT: 8080,
  AUTOMATION_AGENT: `/job/${
    navigator.userAgent.indexOf('Win') != -1
      ? 'windows_test1automation'
      : navigator.userAgent.indexOf('Mac') != -1
      ? 'mac_test1automation'
      : ''
  }/buildWithParameters?token=sportoco`,
  // HOST_COMMAND_URL: 'test4command.sportocotoday.com',
  // HOST_COMMAND_PORT: 80,
  // GAME_APP_URL: 'test4live.sportocotoday.com',
  // GAME_APP_PORT: 80,
  HOST_COMMAND_URL: 'localhost',
  HOST_COMMAND_PORT: 1030,
  GAME_APP_URL: 'localhost',
  GAME_APP_PORT: 2000,
  /*
  HOST_COMMAND_URL: '192.168.0.153',
  HOST_COMMAND_PORT: 1030,
  GAME_APP_URL: '192.168.0.153',
  GAME_APP_PORT: 2000,
*/
}
