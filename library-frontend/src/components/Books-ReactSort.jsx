import { useQuery } from "@apollo/client"
import { GET_ALL_BOOKS } from "./queries"
import { useEffect, useState } from "react"

/* eslint-disable react/prop-types */
const Books = (props) => {

  const [books, setBooks] = useState([])
  const [genres, setGenres] = useState([])
  const [filters, setFilters] = useState([])

    const result = useQuery(GET_ALL_BOOKS, {
      onError: (error) => {
        const messages = error.graphQLErrors.map(e => e.message).join('\n')
        console.log(messages)
      }
    })

    // set initial books state
    useEffect(() => {
      if(!result.loading){
        setBooks(result.data.allBooks)
      }

    }, [result.loading, result.data])

    // get list of active genres to populate buttons
    useEffect(() => {
      if(!genres[0] && books){
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
    },[books])

    if (!props.show) {
      return null
    }

    if (result.loading) return <div> Loading Books...</div>

    const sortGenres = (g) => {
      if(g === 'clear filters') {
        setFilters([])
        setBooks(result.data.allBooks)
        return 
      }
      else{
        const filterList = [...filters, g]
        setFilters([...filters.concat(g)])
        const filteredBooks = books.filter((book) => {
          return filterList.some((f) => book.genres.includes(f))
        })
        setBooks(filteredBooks)
      }
    }

    
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
            {genres.map((g) => [
              <button key={g} onClick={() => sortGenres(`${g}`)}>{g}</button>
            ])}
            <button onClick={() => sortGenres('clear filters')}>clear filters</button>
      </div>
    )
  }
  
  export default Books