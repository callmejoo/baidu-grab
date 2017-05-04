const master = require('./core/master')
const prop = require('commander')
const ora = require('ora')
const log = require('./lib/log')
const fs = require('fs')
const csv = require('./lib/csv')

global.fail = []

prop
  .version('0.1')
  .option('-u, --url [value]', '检索匹配的url')
  .option('-k, --keyword [value]', '指定关键词查询，多个关键词请用英文","隔开。如无-u参数则会返回此关键词的所有结果')
  .option('-d, --deep [value]', '抓取的页数，最大值为8')
  .option('-t, --thread [value]', '(废弃)同时执行查询的线程数，数值越大查询越快，但同时也越不稳定。默认值为2，最大值为5')
  .option('-v, --verbose', '显示详细抓取过程')
  .parse(process.argv);

const keywordsFile = 'keywords.txt'
let opt = {}
let hasErr = false
if (prop.url) {
  opt.url = prop.url
  if (prop.deep) {
    if (prop.deep > 8) {
      opt.deep = 8
    } else {
      opt.deep = prop.deep
    }
  }
  if (prop.keyword) {
    const fs = require('fs')
    let keywords = prop.keyword
    if (keywords.indexOf(',') !== -1) {
        keywords = keywords.replace(',', '\n')
    }
    fs.writeFileSync(keywordsFile, keywords)
  }
  if (prop.verbose) {
      global.verbose = true
  }
  main(opt)
} else if (prop.keyword) {
    opt.keyword = prop.keyword
    const fs = require('fs')
    let keywords = prop.keyword
    if (keywords.indexOf(',') !== -1) {
        keywords = keywords.replace(',', '\n')
    }
    fs.writeFileSync(keywordsFile, keywords)
    if (prop.url) {
        opt.url = prop.url
    }
    if (prop.deep) {
      if (prop.deep > 8) {
        opt.deep = 8
      } else {
        opt.deep = prop.deep
      }
    }
    if (prop.verbose) {
        global.verbose = true
    }
    main(opt)
}
else {
    prop.help()
}

async function main(opt) {
  if (!opt.deep) opt.deep = 3
  prop.thread ? thread = prop.thread : thread = 2
  let t0 = new Date().getTime()
  cleanLog()
  if (opt.url) ora().succeed(`查询与${opt.url}的匹配结果...`)
  else if (opt.keyword) ora().succeed(`查询与【${opt.keyword}】的匹配结果...`)
  else ora().succeed(`正在查询...`)
  let ori = fs.readFileSync('keywords.txt').toString()
  let keywords = ori.replace(/^\n|[ ]|[\r]|\n$/g, '').split('\n')
  let res = await master(keywords, opt.deep)
  // 重试解析失败关键词  

  if (global.fail[0]) {
    ora().warn('有关键词解析失败，准备重试')
    let fail = []
    for (let i in global.fail) {
      fail.push(global.fail[i]['keyword'])
    }
    global.fail = []
    let reRes = await master(fail)
    if (global.fail[0]) {
      hasErr = true
      for (let i in global.fail) {
        log.err(global.fail[i]['keyword'])
      }
    } else {
      ora().succeed(`所有关键词解析成功。`)
    }
    for (let i in reRes) {
      res.push(reRes[i])
    }
  }
  let result = []
  ora().succeed(`所有关键词解析成功。`)
  ora().info('正在汇总结果...')
  for (let i = 0; i < res.length; i++) {
    if (res[i]['status'] === -1) {
      hasErr = true
    } else {
      if (opt.url && !opt.keyword) {
        if (res[i]['url'].indexOf(opt.url) !== -1) {
          result.push({
            title: res[i]['name'],
            link: res[i]['url'],
            keyword: res[i]['keyword'],
          })
        }
      }
      else if (opt.keyword && !opt.url) {
        result.push({
          title: res[i]['name'],
          link: res[i]['url'],
          keyword: res[i]['keyword'],
        })
      }
    }
  }
  printRes(result, t0)
}

function printRes(result, t) {

  // 存储为CSV
  
  let csvHeader = ['关键词', '标题', '真实链接']
  let csvData = []
  for (let i = 0; i < result.length; i++) {
    let per = result[i];
    csvData.push({
      '关键词': per.keyword,
      '标题': per.title,
      '真实链接': per.link,
    })
    console.log('--------------------------------')
    console.log(per.title)
    console.log(per.link)
    console.log('查询关键词：' + per.keyword)
    console.log('--------------------------------\n')
  }
  ora().succeed(`抓取到${result.length}条结果，共耗时${new Date().getTime() - t}ms \n`)
  try {
    csv(csvHeader, csvData)
    ora().succeed(`结果已保存到result.csv文件 \n`)
  } catch (e) {
    ora().fail('保存为csv文件时遇到错误：\n' + e)
  }
  if (hasErr) {
    ora().warn('仍有关键词解析失败，请检查错误日志然后重试。')
  }
  fs.appendFileSync
  process.exit(1)
}

function cleanLog() {
  log.clean()
  ora().succeed('清空错误日志')
  ora().succeed('正在清空错误日志')
}