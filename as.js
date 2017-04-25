const ora = require('ora')

let a = ora('aa').start()
setTimeout(function () {
  setTimeout(function() {
    a.succeed('!!')
  }, 3000);
  a.info('cc')
}, 3000);