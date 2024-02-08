/* eslint-disable react/prop-types */
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { ADD_BOOK, GET_ALL_BOOKS, GET_FILTERED_BOOKS, } from './queries'
import { updateCache, updateFilteredCache } from './utils/updateCache'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])


  const [ createBook ] = useMutation(ADD_BOOK, {
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      console.log(messages)
    },
    update: (cache, response) => {
      updateCache(cache, { query: GET_ALL_BOOKS }, response.data.addBook)
      //second call needed for book with genre filter
      updateFilteredCache(cache, { query: GET_FILTERED_BOOKS }, response.data.bookAdded, response.data.bookAdded.genre)
    },
    
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    createBook({  variables: { title, author, published, genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook