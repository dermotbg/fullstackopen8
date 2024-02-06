/* eslint-disable react/prop-types */
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { LOGIN } from "./queries";

const LoginForm = ({ setError, setToken, setPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data){
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('login-token', token)
    }
  },[result.data])

  const submit = async (e) => {
    e.preventDefault()
    await login({ variables: { username, password } })
    setTimeout(() => {
      setPage('authors')
    },100)
  }

  return(
    <div>
      <form onSubmit={submit}>
        <div>
          username <input
              value={username}
              onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
