const fs = require('fs')
const urlencode = require('urlencode')
const ora = require('ora')

const searchUrl = 'http://www.baidu.com/s?ie=utf-8&wd='

// 根据关键词获取搜索结果网址（前n页）
// list:[{keyword, url1, url2, url3, status}, ...]
module.exports = function (path, deep) {
  let ori = fs.readFileSync(path).toString()
  keywords = ori.replace(/^\n|[ ]|[\r]|\n$/g, '').split('\n')
  let list = []
  for (let i in keywords) {
    list[i] = {}
    list[i]['keyword'] = keywords[i]
    list[i]['status'] = 0
    list[i]['url1'] = searchUrl + urlencode(keywords[i])
    if (deep > 1) {
      if (deep > 8) {
        deep = 8
        ora().fail('抓取页数超过限制，已设置为最大值8')
      }
      for (let a = 0; a < deep; a++) {
        let url = 'url'+ (a+1)
        list[i][url] = searchUrl + urlencode(keywords[i]) + `&pn=${a+1}0`
      }
    }
    list[i].deep = deep
  }
  console.log(list)
  return list
}