const worker = require('./worker')
const ora = require('ora')

// 根据主程序所提供的关键词网址列表分配抓取任务
//requests:[{keyword,url1,url2,url3,status},{}]

module.exports = async function (requests, v) {
  return new Promise(resolve => {
    let t = false   // 是否完成当前关键字的查询
    let d = 0    // 当前完成查询页数
    let i = 0   // 完成的关键词数
    let l = requests.length
    let pageNum = requests[0].deep
    let result = []
    //查询主函数
    let res = await searchOneKeyword()
    function searchOneKeyword() {
      return new Promise(resolve => {
        let key = requests[i]['keyword']
        let k = ora(`查询关键字【${key}】[${i+1}/${l}]`).start()
        for (let a = 0; a < pageNum; a++) {
          url = 'url' + (a + 1)
          worker(requests[i][url], key + `第${a + 1}页`, v).then(resss => {
            result.push({ 'keyword': key + `第${a + 1}页`, res: resss })
              // 判断查询状态
            if (resss === 0) k.fail(`查询【${key}】第${a+1}页超时`)
            d++
            if ((d % pageNum) === 0) {    // 是否抓取完一个关键词
              k.succeed(`查询【${key}】完成[${i+1}/${l}]`)
              t = true
              if (t) {              // 是否抓取完所有关键词
                i++
                t = false
                if (i === l) {
                    resolve(result)
                } else {
                  searchOneKeyword().then(ress => {
                    resolve(result)
                  }).catch(e => {
                    console.log(e)
                  })
                }
              }
            }
          }).catch(e => {
            console.log('错误！！！'+e)
          })
        }
      })
    }
  })
}
