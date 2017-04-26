const load = require('./lib/load')
const searcher = require('./core/searcher')
const prop = require('commander')
const ora = require('ora')
const log = require('./lib/log')

prop
  .version('0.1')
  .option('-d, --deep [value]', '抓取的页数')
  .option('-u, --url [value]', '匹配url')
  .option('-k, --keyword [value]', '指定关键字搜索')
  .option('-v, --verbose', '显示处理过程')
  .parse(process.argv);

const keywordsFile = 'keywords.txt'
let opt = {}
let hasErr = false
if (prop.url) {
  if (prop.deep) {
    opt.deep = prop.deep
    opt.url = prop.url
  } else {
    opt.deep = 3
    opt.url = prop.url
  }
  main(opt)
}
function main(opt) {
  let t0 = new Date().getTime()
  cleanLog()
  let s = ora(`正在查询与${opt.url}的匹配结果...`).start()
  let searchList = load(keywordsFile, opt.deep)
  searcher(searchList).then(res => {
    let result = []
    for (let i = 0; i < res.length; i++) {
      let singlePage = res[i]['res'];
      if (singlePage === 0) {
        hasErr = true
      }
      for (let a = 0; a < singlePage.length; a++) {
        if (singlePage[a]['url'] === 0) {
          hasErr = true
        }
        else if (singlePage[a]['url'].indexOf(opt.url) !== -1) {
          result.push({
            title: singlePage[a]['name'],
            link: singlePage[a]['url']
          })
        }
      }
    }
    printRes(result, s, t0)
  })
}

function printRes(result, s, t) {
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
    s.warn('有链接解析失败，未算入结果中，建议重试或检查错误日志。')
  }
  process.exit(1)
}

function cleanLog() {
  let clog = ora(``)
  log.clean()
  clog.succeed('正在清空错误日志')
}

