export const updateCache = (cache, query, addedBook) => {
  const makeUnique = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }
  cache.updateQuery(query, ({ allBooks }) => {
    console.log(makeUnique(allBooks.concat(addedBook)))
    return {
      allBooks: makeUnique(allBooks.concat(addedBook))
    }
  })
}

export const updateFilteredCache = (cache, query, addedBook, genre = '' ) => {
  const makeUnique = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }
  cache.updateQuery({...query,  variables: { genre } }, ({ allBooks }) => {
    console.log(makeUnique(allBooks.concat(addedBook)))
    return {
      allBooks: makeUnique(allBooks.concat(addedBook))
    }
  })
}