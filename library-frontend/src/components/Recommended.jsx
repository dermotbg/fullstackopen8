import { useQuery } from "@apollo/client"
import { GET_ALL_BOOKS, GET_USER_FAVOURITE } from "./queries"
import { useEffect, useState } from "react"

const Recommended = () => {

    const [filteredBooks, setFilteredBooks] = useState([]) 

    const userFavouriteResult = useQuery(GET_USER_FAVOURITE, {
        refetchQueries: [ { query: GET_USER_FAVOURITE } ],
        onError: (error) => {
          const messages = error.graphQLErrors.map(e => e.message).join('\n')
          console.log(messages)
        }
      })

      const booksResult = useQuery(GET_ALL_BOOKS, {
        refetchQueries: [ { query: GET_ALL_BOOKS } ],
        onError: (error) => {
          const messages = error.graphQLErrors.map(e => e.message).join('\n')
          console.log(messages)
        }
      })

      useEffect(() => {
        if(!userFavouriteResult.loading && !booksResult.loading){
            const booksToFilter = booksResult.data.allBooks
            const favGenre = userFavouriteResult.data.me.favoriteGenre
            setFilteredBooks(booksToFilter.filter((book) => {
                return book.genres.some((g) => g.includes(favGenre))
              })
            )
        }
      },[userFavouriteResult, booksResult])
      
      if(userFavouriteResult.loading || booksResult.loading) return <div>Loading...</div>

      return(
        <div>
        <h2>books with your favorite genre: <em>{userFavouriteResult.data.me.favoriteGenre}</em></h2>
  
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {filteredBooks.map((b) => (
              <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )

}

export default Recommended