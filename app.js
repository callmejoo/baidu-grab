const load = require('./lib/load')
const searcher = require('./core/searcher')
const prop = require('commander')
const ora = require('ora')

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
  let s = ora(`正在查询与${prop.url}的匹配结果...`).start()
  searcher(searchList).then(res => {
    let result = []
    for (let i = 0; i < res.length; i++) {
      let els = res[i]['res'];
      for (let a = 0; a < els.length; a++) {
        if (els[a]['url'].indexOf(prop.url) !== -1) {
          result.push({
            title: els[a]['name'],
            link: els[a]['url']
          })
        }
      }
    }
    s.succeed('查询完毕：\n')
    for (let i = 0; i < result.length; i++) {
      let per = result[i];
      console.log('----------------------')
      console.log(per.title)
      console.log(per.link)
      console.log('----------------------\n')
    }
    s.info(`共有${result.length}条结果，耗时${new Date().getTime() - t0}ms`)
  })
}


