const http = require('http')
const ora = require('ora')

// 根据传来的百度结果链接解析为真实地址并返回  （√ 无bug）
    

    http.get('http://www.baidu.com/link?url=7XEjIA7nPswZ4oFoOFUXfreaHg_UHFSQ99F2zeuKrVK8uO8XgS3SFLvcMKSSY25s', (res) => {
      let { statusCode } = res
      if (statusCode !== 200 && statusCode !== 302) {
        reject(new Error('解析失败，HTTP状态码：'+ statusCode))
        res.resume()
        return
      }
      res.setEncoding('utf8')
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        if (rawData) {
          if (rawData.match(/http.*\)/)) {
                      console.log(1)
          }
        } else {
          reject(new Error(`解析了${link}，但是抓取到了空数据。`))
        }
      })
      res.on('error', (e) => {
        reject(new Error(`错误：${e.message}`))
      })

    }) 