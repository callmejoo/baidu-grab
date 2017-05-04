const https = require('https')
const cheerio = require('cheerio')
const iconv = require('iconv-lite')
const ora = require('ora')
const log = require('./log')

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    let req = https.get(url, res => {
      res.setTimeout(5000, () => {
        log.err(link)
        ora().fail(`解析${link}出错（响应超时）。`)
        reject(new Error(`解析${link}出错（响应超时）。`))
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
        ora().fail(`请求过于频繁，远程服务器拒绝了连接。`)
        reject(`请求过于频繁，远程服务器拒绝了连接。`)
      })
    })
    req.setTimeout(5000, () => {
      log.err(url)
      ora().fail(`解析以下链接时出错（请求超时）↓↓↓\n${url}`)
      reject(`请求超时`)
    })
  })
}