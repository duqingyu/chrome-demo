/**
 * 数据传输
 * @param {String} username 用户名
 * @param {String} data 数据
 */
async function sendData({
  username,
  data
} = {}) {
  return axios.post('/api/...', {
    username,
    data
  })
}
