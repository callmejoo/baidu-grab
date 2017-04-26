const fs = require('fs')
const moment = require('moment')

module.exports.err = function (link) {
  fs.appendFileSync('err.log', `[${moment().format('YYYY-MM-DD hh:mm:ss')}]${link}\n`)
}

module.exports.clean = function () {
  fs.writeFileSync('err.log', '')
}