const { GraphQLError } = require('graphql')

const Author = require('../models/author')
const Book = require('../models/book')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {

      // if no args given
      if(!args.author && !args.genre){ 
        return Book.find({}).populate('author')
      }

      // if only genre given
      else if(args.genre){
        if(args.author){
          const author = await Author.findOne({ name: args.author })
          return Book.find({ genres: args.genre, author: author._id }).populate('author')
        } 
        else return await Book.find({ genres: args.genre  }).populate('author')
      }
      // if only author given

      else {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author._id }).populate('author')
      } 
    },
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let bookAuthor = await Author.findOne({ name: args.author })
      if(!bookAuthor){
        bookAuthor = await Author.create({ name: args.author })
      }        
      const newBook = new Book({ ...args, author: bookAuthor })

      //add to author's books array
      await Author.findByIdAndUpdate(
        bookAuthor._id,
        { $push: { books: newBook._id } }
      )

      const currentUser = context.currentUser
      if(!currentUser){
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      try{
        await newBook.save()
      }
      catch(error){
        throw new GraphQLError('Add book failed' , {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }
      pubsub.publish('BOOK_ADDED', { bookAdded: newBook })
      return newBook
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
}

module.exports = resolvers