const typeDef = `

  type Query {
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID
    genres: [String!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      id: ID
      genres: [String!]!
    ): Book
  }

  type Subscription {
    bookAdded: Book!
  }
`

module.exports = typeDef