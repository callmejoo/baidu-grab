const https = require('https')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const ora = require('ora')
const log = require('../lib/log')

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    let req = https.get(url, res => {
      let { statusCode } = res
      if (statusCode !== 200 && statusCode !== 302 && statusCode !== 301) {
        log.err(url)
        reject(0)
        res.resume()
        return
      }
      res.setTimeout(5000, () => {
        log.err(link)
        r.fail(`解析${link}出错（响应超时）。`)
        reject(0)
      })
      let rawData = []
      res.on('data', chunk => { rawData.push(chunk) })
      res.on('end', () => {
        let Data = iconv.decode(Buffer.concat(rawData), 'gbk')
        let $ = cheerio.load(Data)
        let el = $('#wgt-related li')
        let arr = []
        el.each(function (el, i) {
          let name = $(this).find('a').text().replace(/\s/g, '')
          let link = $(this).find('a').prop('href')
          if (link.indexOf('http') === -1) {
            link = 'https://zhidao.baidu.com' + link
          }
          arr.push({
            name: name,
            url: link
          })
        })
        resolve(arr)
      })
      res.on('error', (e) => {
        log.err(url)
        r.fail(`解析${url}出错（连接错误）`)
        reject(0)
      })
    })
    req.setTimeout(5000, () => {
      log.err(url)
      r.fail(`解析以下链接时出错（请求超时）↓↓↓\n${url}`)
      reject(0)
    })
  })
}