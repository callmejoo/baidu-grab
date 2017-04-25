const worker = require('./worker')
const ora = require('ora')

// 根据load模块所提供的list分配抓取任务
//requests:[{keyword,url1,url2,url3,status},{}]

module.exports = function (requests) {
  return new Promise((resolve, reject) => {
    let t = 0   // 当前完成查询关键字
    let d = 0    // 当前完成查询页数
    let l = requests.length
    let result = []
    for (let i in requests) {
      let key = requests[i]['keyword']
      let k = ora()
      k.succeed(`查询关键字[${key}]`)
      // 抓取第一页
      worker(requests[i]['url1'], key + '第1页').then(res => {
        result.push({ keyword: key + '第1页', res: res })
          d++
          if ((d % 3) === 0) {
            t++
            if (t === l) {
              resolve(result)
            }
          }
      }).catch(err => { })
      // 抓取第二页
      worker(requests[i]['url2'], key + '第2页').then(res => {
        result.push({ keyword: key + '第2页', res: res })
          d++
          if ((d % 3) === 0) {
            t++
            if (t === l) {
              resolve(result)
            }
          }
      }).catch(err => { })
      // 抓取第三页
      worker(requests[i]['url3'], key + '第3页').then(res => {
        result.push({ keyword: key + '第3页', res: res })
          d++
          if ((d % 3) === 0) {
            t++
            if (t === l) {
              resolve(result)
            }
          }
      }).catch(err => { })
    }
  })
}

// 判断查询状态
function check(d, t, l, resolve, result) {
  console.log('当前'+d)
  d++
  console.log('查询第'+d)
  if (d === 3) {
    t++
    if (t === l) resolve(result)
  }
}