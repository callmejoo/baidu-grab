const master = require('./core/master')
// const searcher = require('./core/searcher')
const prop = require('commander')
const ora = require('ora')
const log = require('./lib/log')

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
  let tip = ``
  if (opt.url) {
      ora().succeed(`查询与${opt.url}的匹配结果...`)
  }
  else if (opt.keyword) {
      ora().succeed(`查询与【${opt.keyword}】的匹配结果...`)
  } else {
      ora().succeed(`正在查询...`)
  }
  let res = await master(keywordsFile, opt.deep, opt.thread, opt.v)
  let anlyze = ora('正在分析结果...').start()
  let result = []
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
  anlyze.succeed('完成')
  printRes(result, t0)
}

function printRes(result, t) {
    ora().succeed('查询完成！结果如下：\n')
    for (let i = 0; i < result.length; i++) {
        let per = result[i];
        console.log('--------------------------------')
        console.log(per.title)
        console.log(per.link)
      console.log('查询关键词：' + per.keyword)
        console.log('--------------------------------\n')
    }
    ora().succeed(`抓取到${result.length}条结果，共耗时${new Date().getTime() - t}ms \n`)
    if (hasErr) {
        s.warn('有链接解析失败，未算入结果中，建议重试或检查错误日志。')
    }
    process.exit(1)
}

function cleanLog() {
    log.clean()
    ora().succeed('正在清空错误日志')
}