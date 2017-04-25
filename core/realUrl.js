const http = require('http')
const ora = require('ora')

// 根据传来的百度结果链接解析为真实地址并返回  （√ 无bug）

module.exports = function (link) {
  return new Promise((resolve, reject) => {
    http.get(link, (res) => {
      let { statusCode } = res
      if (statusCode !== 200 && statusCode !== 302) {
        reject(new Error('解析失败，HTTP状态码：'+ statusCode))
        res.resume()
        return
      }
      res.setEncoding('utf8')
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        if (rawData) {
          resolve(rawData.match(/http.*\)/)[0].slice(0,-2))
        } else {
          reject(new Error(`解析了${link}，但是抓取到了空数据。`))
        }
      })
      res.on('error', (e) => {
        reject(new Error(`错误：${e.message}`))
      })
    }) 
  })
}