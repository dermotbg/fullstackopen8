import { gql } from '@apollo/client'

export const GET_ALL_AUTHORS = gql`
  query {
    allAuthors{
      name
      born
      bookCount
    }
  }
`

export const GET_ALL_BOOKS = gql`
  query {
    allBooks{
      title
      published
      author{
        name
      }
      genres
    }
  }
`

// export const GET_ALL_GENRES = gql`
//   query {
//     allBooks{
//       genres
//     }
//   }  
// `

export const ADD_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      published: $published,
      author: $author,
      genres: $genres
    ) {
      title
      published
      author{
        name
      }
      genres
    }
  }
`

export const EDIT_BIRTHYEAR = gql`
  mutation addYear($name: String!, $birthyear: Int!) {
    editAuthor (name: $name, setBornTo: $birthyear){
      name
      born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!){
    login(username: $username, password: $password){
      value
    }
  }
`