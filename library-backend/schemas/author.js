const typeDef = `
  type Query {
    authorCount: Int!
    allAuthors: [Author!]!
  } 

  type Author {
    name: String!
    id: ID
    born: Int
    books: [Book!]!
    bookCount: Int
  }

  type Mutation {
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

module.exports = typeDef