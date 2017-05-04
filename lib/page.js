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
      res.on('error', e => {
        reject('获取分页链接时超时')
      })
    })
    req.setTimeout(5000, () => {
      reject(`尝试抓取分页链接时超时`)
    })
    req.on('error', e => {
      log.err(url)
      reject(`请求过于频繁，远程服务器拒绝了连接。`)
    })
  })
}