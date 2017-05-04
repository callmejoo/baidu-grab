const fs = require('fs')

module.exports.err = function (link) {
  fs.appendFileSync('err.log', `${link}\n`)
}

module.exports.clean = function () {
  fs.writeFileSync('err.log', '')
}