import { dialogsListAPI, messagesAPI, userAPI } from '../utils/api'
import openNotification from '../utils/helpers/openNotification'
import io from 'socket.io-client'
import DiffieHallman from '../utils/helpers/DiffieHallman'
import MesagesEncryption from '../utils/helpers/MessagesEncryption'

export const dialogsActions = {
  setDialogs: items => ({
    type: 'DIALOGS_SET_ITEMS',
    payload: items
  }),
  addDialog: (dialog, DiffieHallmanData = null, key = null) => (dispatch, getState) => {
    const {user: {socket}} = getState()
    if(DiffieHallmanData) {
      const {k, B} = DiffieHallman.accept(DiffieHallmanData)
      key = k
      socket.emit('DIALOG_ACCEPTED', { dialog, B })
    }
    MesagesEncryption.saveSecretKey(key, dialog._id)
    dispatch({
      type: 'ADD_DIALOG',
      payload: dialog
    })
  },
  clearDialogs: () => ({
    type: 'CLEAR_DIALOGS'
  }),
  setPartnerStatus: (partnerId, isOnline) => ({
    type: 'SET_PARTNER_STATUS',
    payload: {
      partnerId, 
      isOnline
    }
  }),
  updateUnreadedCount: (dialogId, unreadedCount) => ({
    type: 'UPDATE_UNREADED_COUNT',
    payload: {
      dialogId, 
      unreadedCount
    }
  }),
  setCurrentDialog: id => (dispatch, getState) => {
    if(id !== null) {
      const {user: {data, socket}, dialogs: {dialogs}} = getState()
      const currentDialog = dialogs.filter(dialog => dialog._id === id)[0]
      const partnerId = data._id === currentDialog.author._id ? currentDialog.partner._id : currentDialog.author._id
      socket.emit('DIALOG_ENTERED', {dialog_id: id, partner_id: partnerId})
      dispatch(dialogsActions.updateUnreadedCount(currentDialog._id, 0))
    }
    dispatch({
      type: 'SET_CURRENT_DIALOG_ID',
      payload: id
    })
  },
  updateLastMessage: (dialogId, message) => ({
    type: 'UPDATE_LAST_MESSAGE',
    payload: {
      dialogId, 
      message
    }
  }),
  updateLastMessageReaded: dialogId => ({
    type: 'UPDATE_LAST_MESSAGE_READED',
    payload: dialogId
  }),
  createDialog: (partnerId, DiffieHallmanData) => (_, getState) => {
    const {user: {data}} = getState()
    
    return dialogsListAPI.createDialog(data._id, partnerId, DiffieHallmanData)
  },
  deleteDialog: (dialogId) => async (dispatch) => {
    await dispatch(dialogsActions.setCurrentDialog(null))
    await dialogsListAPI.deleteDialog(dialogId)
    dispatch({
      type: 'DELETE_DIALOG',
      payload: dialogId
    })
  },
  fetchDialogs: () => dispatch => {
    return dialogsListAPI.getAllDialogs().then(({data}) => {
      if(data.length)
        dispatch(dialogsActions.setDialogs(data))
    })
  }
}
 
export const currentDialogActions = {
  setMessages: items => ({
    type: 'SET_CURRENT_DIALOG',
    payload: items
  }),
  clearCurrentDialog: () => ({
    type: 'CLEAR_CURRENT_DIALOG'
  }),
  addMessage: message => ({
    type: 'ADD_MESSAGE',
    payload: message
  }),
  updateIsReaded: (dialogId) => (dispatch, getState) => {
    const {user: {data}} = getState()
    dispatch({
      type: 'UPDATE_IS_READED',
      payload: {dialogId, myId: data._id}
    })
  },
  sendMessage: text => (_, getState) => {
    const {currentDialog: {currentDialog}} = getState()
    const encryptedText = MesagesEncryption.encryptMessage(text, currentDialog)
    if(!encryptedText) return Promise.reject(new Error('Данный диалог недоступен на этом устройстве'))

    return messagesAPI.sendMessage(encryptedText, currentDialog)
  },
  setLoading: (isLoading) => ({
    type: 'SET_LOADING',
    payload: isLoading
  }),
  fetchMessages: dialogId => dispatch => {
    if(dialogId === null) return dispatch(currentDialogActions.setMessages(null))
    dispatch(currentDialogActions.setLoading(true))
    messagesAPI.getAllByDialogId(dialogId).then(({data}) => {
      dispatch(currentDialogActions.setMessages(MesagesEncryption.decryptMessages(data || [], dialogId)))
    })
  }
}


export const userActions = {
  setUserData: data => ({
    type: 'USER_SET_DATA',
    payload: data
  }),
  clearUserData: () => (dispatch, getState) => {
    const {user: {socket}} = getState()
    socket.disconnect()
    window.localStorage.clear()
    dispatch({
      type: 'CLEAR_USER_DATA'
    })
  },
  setToken: token => ({
    type: 'SET_TOKEN',
    payload: token
  }),
  setIsAuth: isAuth => ({
    type: 'SET_IS_AUTH',
    payload: isAuth
  }),
  socketCreateConnection: token => ({
    type: 'SOCKET_CREATE_CONNECTION',
    payload: io(`${process.env.REACT_APP_API_URL}`, {
      query: {
        token
      }
    })
  }),
  fetchUserData: token => dispatch => {
    userAPI.getMe(token).then(({ data }) => {
      dispatch(userActions.setUserData(data))
    })
  },
  fetchUserLogin:  postData =>  (dispatch) => {
    return userAPI.login(postData).then(({ data }) => {
        const {status, token} = data
        if(status === 'error'){
          openNotification({text: 'Неверный логин или пароль', title: 'Ошибка при авторизации', type: 'error'})
        }
        else{
          openNotification({title: 'Отлично!', text: 'Авторизация успешна', type: 'success'})
          window.localStorage.token = token
          dispatch(userActions.socketCreateConnection(token))
          dispatch(userActions.setToken(token))
          dispatch(userActions.setIsAuth(true))
          dispatch(userActions.fetchUserData(token))
        }
        return status
      })
  },
  fetchUserRegistration: postData =>  (dispatch, getState)=> {
    return userAPI.register(postData).then(({ data }) => {
        const {status, token} = data
        if(status === 'error'){
          openNotification({text: 'Ошибка при регистрации', title: 'Упс', type: 'error'})
        }
        else{
          openNotification({title: 'Отлично!', text: 'Регистрация прошла успешно', type: 'success'})
          window.localStorage.token = token
          const {user: {socket}} = getState()
          socket.disconnect()
          dispatch(userActions.socketCreateConnection(token))
          dispatch(userActions.setToken(token))
          dispatch(userActions.setIsAuth(true))
          dispatch(userActions.fetchUserData(token))
        }
        return status
      })
  }
}