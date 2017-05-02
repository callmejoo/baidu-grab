const http = require('http')
const ora = require('ora')
const log = require('../lib/log')
const zhidao = require('../lib/zhidao')

// 根据传来的百度结果链接解析为真实地址并返回  （√ 无bug）

module.exports = function (link, v) {
  return new Promise((resolve, reject) => {
    let r = ora(``)
    try{
     let req = http.get(link, (res) => {
        let { statusCode } = res
        if (statusCode !== 200 && statusCode !== 302) {
          log.err(link)
          reject(0)
          res.resume()
          return
        }
        res.setTimeout(5000, () => {
          log.err(link)
          r.fail(`解析${link}出错（响应超时）。`)
          reject(0)
        })
        res.setEncoding('utf8')
        let rawData = '';
        let real = ''
        res.on('data', (chunk) => { rawData += chunk })
        res.on('end', () => {
          req.end()
          if (res.headers['location']) {
            if (v) r.succeed(res.headers['location'])
            real = res.headers['location']
          } else if (rawData.match(/http.*\)/)) {
            if (v) r.succeed(rawData.match(/http.*\)/)[0].slice(0, -2))
            real = rawData.match(/http.*\)/)[0].slice(0, -2)
          } else {
            log.err(link)
            r.fail(new Error(`解析了${link}，但是未发现真实地址。`))
            resolve(0)
          }
          if (real.indexOf('zhidao.baidu.com') !== -1) {
            zhidao(real, v).then(ress => {
              resolve(ress)
            }).catch(e => {
              reject(0)
            })
          } else {
            resolve(real)
          }
        })
        res.on('error', (e) => {
          log.err(link)
          r.fail(`解析${link}出错（连接错误）`)
          reject(0)
        })
      })
     req.on('error', e => {
       r.fail(`${link}`)
       req.abort()
       reject(0)
      })
     req.setTimeout(5000, () => {
        log.err(link)
        r.fail(`解析以下链接时出错（请求超时）↓↓↓\n${link}`)
        reject(0)
      })
    } catch (e) {
      log.err(link)
      r.fail(`解析${link}出错（未知错误）`)
      reject(0)
    }
  
  })
}