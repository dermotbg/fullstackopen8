import { useApolloClient, useQuery } from "@apollo/client"
import { GET_FILTERED_BOOKS } from "./queries"
import { useEffect, useState } from "react"

/* eslint-disable react/prop-types */
const Books = (props) => {

  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [filter, setFilter] = useState('')
  const client = useApolloClient()

    const result = useQuery(GET_FILTERED_BOOKS, {
      onError: (error) => {
        const messages = error.graphQLErrors.map(e => e.message).join('\n')
        console.log(messages)
      },
      variables: { genre: filter }
    })

    // set initial books state
    useEffect(() => {
      if(!result.loading){
        setBooks(result.data.allBooks)
      }

    }, [result.loading, result.data])

    // get list of active genres to populate buttons
    useEffect(() => {
      // condition to stop re-generating genres based off filtered books
      if(filter !== '') {
        return
      }
      if(!result.loading){
        //create array of genre arrays for each book
        const tempBooks = books.map((b) => b.genres)
        // consolidate into single array of unique genres 
        const tempGenres = tempBooks.reduce((acc, curr) => {
          curr.map((g) => {
            if(!acc.includes(g)){
              //push and return acc to initial reduce
              acc.push(g)
              return acc
            }
          })
          //ret final array 
          return acc
        },[])
        setGenres(tempGenres)
      } 
    },[result.loading, books])

    const resetFilters = () => {
      client.resetStore() 
      setFilter('')
    }

    if (!props.show) {
      return null
    }

    if (result.loading) return <div> Loading Books...</div>

    
    return (
      <div>
        <h2>books</h2>
  
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {books.map((b) => (
              <tr key={b.title}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
            {genres.map((g) => (
              <button key={g} onClick={() => setFilter(`${g}`)}>{g}</button>
            ))}
            <button onClick={resetFilters}>clear filters</button>
      </div>
    )
  }
  
  export default Books