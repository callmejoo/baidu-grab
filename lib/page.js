const http = require('http')
const cheerio = require('cheerio')
const ora = require('ora')
const log = require('./log')

// 返回关键词的各页数链接
// List：[url1, url2, ...]

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    let req = http.get(url, res => {
      res.setTimeout(5000, () => {
        ora().fail('获取响应超时')
      })
      res.setEncoding('utf8')
      rawData = ''
      res.on('data', chunk => {
        rawData += chunk
      })
      res.on('end', () => {
        let $ = cheerio.load(rawData)
        let pageEl = $('#page').contents()
        let page = []
        pageEl.each((i, el) => {
          if (i > 0 && i < 9) {
            page.push(el.attribs['href'])
          }
        })
        resolve(page)
      })
    })
    req.setTimeout(5000, () => {
      ora().fail('请求超时')
      reject(new Error(`请求超时`))
    })
    req.on('error', e => {
      ora().fail('请求过于频繁，远程服务器拒绝了连接。')
      log.err(url)
      reject(new Error(`请求过于频繁，远程服务器拒绝了连接。`))
    })
  })
}