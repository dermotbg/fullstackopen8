import { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient, useQuery } from '@apollo/client'
import Recommended from './components/Recommended'
import { GET_ALL_BOOKS } from './components/queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

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