const http = require('http')
const cheerio = require('cheerio')
const ora = require('ora')
const realUrl = require('./realUrl')
const log = require('../lib/log')

// 请求所提供的网址，并解析出真实地址以list返回(一页)
// list: [{ name, url }, ...]

module.exports = function (url, keyword, v) {
  return new Promise((resolve, reject) => {
    httpGet(url, keyword, v).then(res => {
      if (res === 0) {
        log.err(url)
      }
      resolve(res)
    })
  })
}

// 发起请求
function httpGet(url, keyword, v) {
  return new Promise((resolve, reject) => {
    try {
    let req =  http.get(url, (res) => {
        let { statusCode } = res
        if (statusCode !== 200) {
          resolve(0)
          ora().fail(`[${statusCode}]` + req.url)
          res.resume()
          return
        }
        res.setTimeout(5000, () => {
          log.err(url)
          resolve(0)
        })
        res.setEncoding('utf8')
        let rawData = ''
        // let t0 = new Date().getTime()
        res.on('data', (chunk) => { rawData += chunk })
        res.on('end', () => {
          try {
            // getting.succeed(`[${req.keyword}]请求完成，用时:` + (new Date().getTime() - t0) + 'ms')
            let links = getLinks(rawData)
            getReal(links, v).then(ress => {
              resolve(ress)
            })
          } catch (e) {
            resolve(0)
          }
        }).on('error', (e) => {
          resolve(0)
        })
      })
    req.setTimeout(8000, () => {
      log.err(url)
      resolve(0)
    })
    } catch (e) {
      log.err(url)  
      resolve(0)
    }
  })
}

// 收集搜索结果链接 （√ 无bug）
// res: [{ name, url }, ...]
function getLinks(html) {
  let $ = cheerio.load(html)
  let el = $('#content_left').contents().find('h3')
  let res = []
  el.each(function (i, el) {
    link = $(this).find('a').prop('href')
    if (link && link.indexOf('baidu.php') === -1) { // 过滤空链接和广告链接
      res.push({
        name: $(this).text().replace(/\s/g,''),
        url: link
      })
    }
  })
  return res
}

// 获取真实地址
// arr:[{name, url}, ...]

function getReal(links, v) {
  //links:[{name, url}, ...]
  let c0 = 0
  return new Promise(resolve => {
    let arr = []
    for (let i = 0; i < links.length; i++) {
      let url = links[i]['url']
      // let realTip = ora('正在解析真实地址'+url)
      realUrl(url, v).then(function (res) {
        c0++
        arr.push({
          name: links[i].name,
          url: res
        })
        if (c0 === links.length) {
          resolve(arr)
        }
      }).catch(err => {
        c0++
        arr.push({
          name: links[i].name,
          url: 0
        })
        if (c0 === links.length) {
          resolve(arr)
        }
      })
      // realTip.stop()
    }
  })
}