const load = require('./lib/load')
const searcher = require('./core/searcher')
const prop = require('commander')
const ora = require('ora')
const log = require('./lib/log')

prop
  .version('0.1')
  .option('-u, --url [value]', '匹配url')
  .option('-k, --keyword [value]', '指定关键字搜索')
  .option('-v, --verbose', '显示处理过程')
  .parse(process.argv);

const keywordsFile = 'keywords.txt'
let searchList = load(keywordsFile)


if (prop.url) {
  let t0 = new Date().getTime()
  let clog = ora(``)
  log.clean()
  clog.succeed('正在清空错误日志')
  let s = ora(`正在查询与${prop.url}的匹配结果...`).start()
  searcher(searchList).then(res => {
    printRes(res, s , t0)
  })
}

function printRes(res, s, t) {
  let result = []
  let hasErr = false
  for (let i = 0; i < res.length; i++) {
    let els = res[i]['res'];
    if (els === 0) {
        hasErr = true
    }
    for (let a = 0; a < els.length; a++) {
      if (els[a]['url'] === 0) {
        hasErr = true
      }
      else if (els[a]['url'].indexOf(prop.url) !== -1) {
        result.push({
          title: els[a]['name'],
          link: els[a]['url']
        })
      }
    }
  }
  s.succeed('查询完成！结果如下：\n')
  for (let i = 0; i < result.length; i++) {
    let per = result[i];
    console.log('--------------------------------')
    console.log(per.title)
    console.log(per.link)
    console.log('--------------------------------\n')
  }
  s.succeed(`抓取到${result.length}条结果，共耗时${new Date().getTime() - t}ms \n`)
  if (hasErr) {
    s.warn('有链接解析失败，未算入结果中，请检查错误日志。')
  }
  process.exit(1)
}


