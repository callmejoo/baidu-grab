const fs = require('fs')
const urlencode = require('urlencode')

const searchUrl = 'http://www.baidu.com/s?ie=utf-8&wd='

// 根据关键词获取搜索结果网址（前3页）
// list:[{keyword, url1, url2, url3, status}, ...]
module.exports = function (path) {
  let ori = fs.readFileSync(path).toString()
  keywords = ori.replace(/^\n|[ ]|[\r]|\n$/g, '').split('\n')
  let list = []
  for (let i in keywords) {
    list[i] = {}
    list[i]['keyword'] = keywords[i]
    list[i]['url1'] = searchUrl + urlencode(keywords[i])
    list[i]['url2'] = searchUrl + urlencode(keywords[i]) + '&pn=10'
    list[i]['url3'] = searchUrl + urlencode(keywords[i]) + '&pn=20'
    list[i]['status'] = 0
  }
  return list
}