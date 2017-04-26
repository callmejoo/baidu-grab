const worker = require('./worker')
const ora = require('ora')

// 根据load模块所提供的list分配抓取任务
//requests:[{keyword,url1,url2,url3,status},{}]

module.exports = function (requests) {
  return new Promise((resolve, reject) => {
    let t = 0   // 当前完成查询关键字
    let d = 0    // 当前完成查询页数
    let l = requests.length
    let pageNum = requests[0].deep
    let result = []
    for (let i in requests) {
      let k = ora()
      let key = requests[i]['keyword']
      k.succeed(`查询关键字【${key}】，共${pageNum}页`)
      for (let a = 0; a < pageNum; a++) {
        url = 'url' + (a + 1)
        worker(requests[i][url], key + `第${a+1}页`).then(ress => {
          result.push({ keyword: key + `第${a + 1}页`, res: ress })
            // 判断查询状态
          if (ress === 0) k.fail(`查询【${key}】第${a+1}页超时`)
          d++
          if ((d % pageNum) === 0) {    // 是否抓取完一个关键词
            k.succeed(`查询【${key}】完成`)
            t++
            if (t === l) {              // 是否抓取完所有关键词
              resolve(result)
            }
          }
        })
      }
    }
  })
}

      // 抓取第一页
      // // 抓取第二页
      // worker(requests[i]['url2'], key + '第2页').then(res => {
      //   result.push({ keyword: key + '第2页', res: res })
      //   if (res === 0) {
      //       k.fail(`查询关键字【${key}】第2页超时`)
      //   }
      //   d++
      //   if ((d % 3) === 0) {
      //     t++
      //     if (t === l) {
      //       resolve(result)
      //     }
      //   }
      // })
      // // 抓取第三页
      // worker(requests[i]['url3'], key + '第3页').then(res => {
      //   result.push({ keyword: key + '第3页', res: res })
      //   if (res === 0) {
      //       k.fail(`查询关键字【${key}】第3页超时`)
      //   }
      //   d++
      //   if ((d % 3) === 0) {
      //     t++
      //     if (t === l) {
      //       resolve(result)
      //     }
      //   }
      // })