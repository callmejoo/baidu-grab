const http = require('http')
const log = require('./log')
const ora = require('ora')
const cheerio = require('cheerio')

module.exports = function (url, v) {
  return new Promise((resolve, reject) => {
    let req = http.get(url, (res) => {
      res.setTimeout(5000, () => {
        log.err(url)
        reject(new Error(`等待页面所有链接响应时超时`))
      })
      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        try {
          let $ = cheerio.load(rawData)
          let el = $('#content_left').contents().find('h3')
          let realLinks = []
          el.each(function (i, el) {
            link = $(this).find('a').prop('href')
            if (link && link.indexOf('baidu.php') === -1) { // 过滤空链接和广告链接
              realLinks.push({
                name: $(this).text().replace(/\s/g,''),
                url: link,
                status: 0
              })
            }
          })
          resolve(realLinks)
        } catch (e) {
          reject(new Error(`等待结果时出错:\n${e}`))
        }
      })
      res.on('error', (e) => {
        log.err(url)
        reject(new Error(`等待页面所有链接响应时发生错误:\n${e}`))
      })
    })
    req.setTimeout(8000, () => {
      log.err(url)
      reject(new Error(`请求页面所有链接时超时`))
    })
    req.on('error', e => {
      reject(new Error(`请求过于频繁，远程服务器拒绝了连接。`))
    })
  })
}