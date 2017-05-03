const ora = require('ora')
const getPageLinks = require('../lib/pagelinks')
const getRealUrl = require('../lib/realUrl')

// 返回单页所有真实链接

module.exports = async function (pagelink, keyword) {
    let pageLinks = await getPageLinks(pagelink['url'])
    let s = 0  // 解析完成数
    return new Promise(resolve => {
      let realUrl = []
      for (let i = 0; i < pageLinks.length; i++) {
        let link = pageLinks[i]['url'];
        getRealUrl(link).then(res => {
          s++
          // console.log(`[${s}/${pageLinks.length}]，真实地址：${res}`)
          realUrl.push({
            name: pageLinks[i]['name'],
            url: res,
            keyword: keyword,
            status: 1
          })
          if (s === pageLinks.length) resolve(realUrl)
        }).catch(e => {
          s++
          // console.log(`${s}/${pageLinks.length}]`)
          realUrl.push({
            name: pageLinks[i]['name'],
            url: link,
            keyword: keyword,
            status: -1
          })
          if (s === pageLinks.length) resolve(realUrl)
        })
      }
    })
}