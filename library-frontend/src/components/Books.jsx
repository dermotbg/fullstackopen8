import { useQuery } from "@apollo/client"
import { GET_ALL_BOOKS } from "./queries"

/* eslint-disable react/prop-types */
const Books = (props) => {

    const result = useQuery(GET_ALL_BOOKS, {
      refetchQueries: [ { query: GET_ALL_BOOKS } ],
      onError: (error) => {
        const messages = error.graphQLErrors.map(e => e.message).join('\n')
        console.log(messages)
      }
    })

    if (!props.show) {
      return null
    }

    if (result.loading) return <div> Loading Books...</div>

    
    const books = result.data.allBooks
    
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
      </div>
    )
  }
  
  export default Books