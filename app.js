const load = require('./lib/load')
const searcher = require('./core/searcher')
const prop = require('commander')
const ora = require('ora')
const log = require('./lib/log')

prop
    .version('0.1')
    .option('-u, --url [value]', '检索匹配的url')
    .option('-k, --keyword [value]', '指定关键词查询，多个关键词请用英文","隔开。如无-u参数则会返回此关键词的所有结果')
    .option('-d, --deep [value]', '抓取的页数，最大值为8')
    .option('-v, --verbose', '显示详细抓取过程')
    .parse(process.argv);

const keywordsFile = 'keywords.txt'
let opt = {}
let hasErr = false

if (prop.url) {
    if (prop.deep) {
        opt.deep = prop.deep
        opt.url = prop.url
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
        opt.v = true
    } else {
      if (opt.deep > 8) {
        opt.deep = 8
      } else {
        opt.deep = 3
      }
        opt.url = prop.url
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
        opt.deep = prop.deep
    }
    if (prop.verbose) {
        opt.v = true
    } else {
      if (opt.deep > 8) {
        opt.deep = 3
      }
    }
    main(opt)
}
else {
    prop.help()
}

function main(opt) {
    let t0 = new Date().getTime()
    cleanLog()
    let tip = ``
    if (opt.url) {
        tip = `正在查询与${opt.url}的匹配结果...`
    }
    else if (opt.keyword) {
        tip = `正在查询与【${opt.keyword}】的匹配结果...`
    } else {
        tip = `正在查询...`
    }
    let s = ora(tip).start()
    let searchList = load(keywordsFile, opt.deep)
    searcher(searchList, opt.v).then(res => {
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
              if (opt.url && !opt.keyword) {
                if (singlePage[a]['url'].indexOf(opt.url) !== -1) {
                  result.push({
                    title: singlePage[a]['name'],
                    link: singlePage[a]['url']
                  })
                }
              }
              else if (opt.keyword && !opt.url) {
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