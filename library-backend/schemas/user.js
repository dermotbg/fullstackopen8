const typeDef = `
  type Query {
    me: User
  } 

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Mutation {
    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }
`

module.exports = typeDef