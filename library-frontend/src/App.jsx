import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import Recommended from './components/Recommended'
import { BOOK_ADDED, GET_ALL_BOOKS, GET_FILTERED_BOOKS } from './components/queries'
import { updateCache, updateFilteredCache } from './components/utils/updateCache'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      console.log(data)
      const title = data.data.bookAdded.title
      window.alert(`${title} added`)
      updateCache(client.cache, { query: GET_ALL_BOOKS }, data.data.bookAdded)
      //second call needed for book with genre filter
      updateFilteredCache(client.cache, { query: GET_FILTERED_BOOKS }, data.data.bookAdded, data.data.bookAdded.genre)
    }
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const result = useQuery(GET_ALL_BOOKS, {
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      console.log(messages)
    }
  })

  useEffect(() => {
    const localToken = JSON.stringify(localStorage.getItem('login-token'))
    if(!token && localToken !== 'null'){
      setToken(localToken)
    }
  },[token])


  if(result.loading) return <div>Loading...</div>
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {!token 
          ? <button onClick={() => setPage('login')}>login</button>
          : <>
              <button onClick={() => setPage('add')}>add book</button>
              <button onClick={() => setPage('recommended')}>recommended</button>
              <button onClick={logout}>logout</button>
            </>
        }
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} books={result.data.allBooks} />

      <NewBook show={page === 'add'} />

      {token && page === 'recommended' 
        ? <Recommended show={page === 'recommended'} />
        : null
      }

      <LoginForm setToken={setToken} setPage={setPage} show={page === 'login'} />

    </div>
  )
}

export default App