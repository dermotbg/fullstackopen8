const authorResolvers = require('./author')
const bookResolvers = require('./book')
const userResolvers = require('./user')

const merge = require('lodash.merge')


const resolvers = merge(authorResolvers, bookResolvers, userResolvers)

module.exports = resolvers