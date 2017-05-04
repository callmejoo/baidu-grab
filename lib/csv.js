const json2csv = require('json2csv')
const fs = require('fs')
const ora = require('ora')

module.exports = function (header, data) {
  let result = json2csv({ data: data, fields: header })
  fs.writeFileSync('result.csv', result)
} 
