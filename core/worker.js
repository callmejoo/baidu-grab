const ora = require('ora')
const getPageLinks = require('../lib/pagelinks')
const realUrl = require('../lib/realUrl')

module.exports = async function (pagelink) {
    let pageLinks = await getPageLinks(pagelink['url'])
    console.log(pageLinks)
}