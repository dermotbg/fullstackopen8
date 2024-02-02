/* eslint-disable react/prop-types */
import { useMutation, useQuery } from '@apollo/client'
import { EDIT_BIRTHYEAR, GET_ALL_AUTHORS } from './queries'
import { useState } from 'react'

const Authors = (props) => {

    const [name, setName] = useState('')
    const [birthyear, setBirthyear] = useState('')

    const [ updateBirthyear ] = useMutation(EDIT_BIRTHYEAR, {
      refetchQueries: [{ query: GET_ALL_AUTHORS }],
      onError: (error) => {
        const messages = error.graphQLErrors.map(e => e.message).join('\n')
        console.log(messages)
      }
    })

    const result = useQuery( GET_ALL_AUTHORS, {
      refetchQueries: [ { query: GET_ALL_AUTHORS } ]
    })

    if (!props.show) {
      return null
    }

    const submit = (e) => {
      e.preventDefault()
      updateBirthyear({ variables: { name, birthyear } })
      setName('')
      setBirthyear('')
    } 

    
    if (result.loading) {
      return <div>loading...</div>
    }
    
    const authors = result.data.allAuthors

    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Set birthyear</h3>
        <form onSubmit={submit}>
          <select value={name} onChange={(e) => setName(e.target.value)} >
            {authors.map((a) => {
              return(
                <option key={a.name} value={a.name}>{a.name}</option>
              )
            })}
          </select>
          {/* <div>
            name
            <input type="text"
              value={name}
              onChange={({ target }) => setName(target.value)} />
          </div> */}
          <div>
            born
            <input
              type="number" value={birthyear}
              onChange={({ target }) => setBirthyear(Number(target.value))}
             />
          </div>
          <button type='submit'> Update Author</button>
        </form>
      </div>
    )
  }
  
  export default Authors