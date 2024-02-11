const Book = require('./book') 
const Author = require('./author') 
const User = require('./user') 
const Token = require('./token')

const typeDefs = [ Book, Author, User, Token ]

module.exports = typeDefs