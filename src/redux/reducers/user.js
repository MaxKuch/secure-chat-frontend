import io from 'socket.io-client'

const initialState = {
  data: null,
  token: window.localStorage.token || '',
  socket: io(`${process.env.REACT_APP_API_URL}`, {
    query: {
      token: window.localStorage.token || ''
    }
  }),
  isAuth: !!window.localStorage.token
}

const handlers = {
  USER_SET_DATA: (state, payload) => ({...state, data: payload}),
  CLEAR_USER_DATA: () => ({data: null, token: '', socket: null, isAuth: false}),
  SOCKET_CREATE_CONNECTION: (state, payload) => ({...state, socket: payload}),
  SET_TOKEN: (state, payload) => ({...state, token: payload}),
  SET_IS_AUTH: (state, payload) => ({...state, isAuth: payload}),
  DEFAULT: state => state
}

const userReducer = (state = initialState, { type, payload }) => {
  const handle = handlers[type] || handlers.DEFAULT
  return handle(state, payload)
}

export default userReducer