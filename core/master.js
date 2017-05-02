const fs = require('fs')
const urlencode = require('urlencode')
const ora = require('ora')
const getPage = require('../lib/page')
const worker = require('./worker')

const numCpus = require('os').cpus().length
const engin = 'http://www.baidu.com'
const searchUrl = 'http://www.baidu.com/s?ie=utf-8&wd='

// 爬虫主程序，将每个关键词每页链接分配给worker
// list:[{keyword, url1, url2, url3, status}, {}...]

module.exports = async function (path, deep, thread, v) {
  let ori = fs.readFileSync(path).toString()
  keywords = ori.replace(/^\n|[ ]|[\r]|\n$/g, '').split('\n')
  let [list,result] = [[],[]]
  for (let i in keywords) {
    let prog = ora(`正在查询关键词【${keywords[i]}】[${parseInt(i)+ 1}/${keywords.length}]`).start()
    list[i] = {
      keyword: null,
      urls: null,
      deep: null
    }
    list[i]['keyword'] = keywords[i]
    list[i]['urls'] = []
    let url1 = searchUrl + urlencode(keywords[i])
    let urls = []
    if (deep <= 1) urls.push({url: url1, status: 0 })
    else {    // 当查询页面大于1时，输出每页链接
      urls.push({url: url1, status: 0 })
      try {
        res = await getPage(url1)
      } catch (e) {
        ora().fail(`关键词【${keywords[i]}】分页获取错误。`)
      }
      if (deep > 8) {
        deep = 8
        ora().fail('抓取页数超过限制，已设置为最大值8')
      }
      list[i]['deep'] = deep
      for (let a = 1; a <= deep - 1; a++) {
        urls.push({ url: engin + res[a], status: 0}) 
      }
      list[i]['urls'] = urls
      ora().succeed(`关键词【${keywords[i]}】分页获取成功[${parseInt(i)+1}/${keywords.length}]`)
    }
    let singlePage = list[i]
    for (let i = 0; i < singlePage['urls'].length; i++) {
      try {
        let realList = await worker(singlePage['urls'][i])
        singlePage['urls'][i]['status'] = 1
      } catch (e) {
        singlePage['urls'][i]['status'] = -1
        ora().fail(`解析出错:\n${e}`)
      }
      
    }
  }
  return list
}