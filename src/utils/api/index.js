import axios from '../../core/axios'

export const dialogsListAPI = {
  getAllDialogs: () => axios.get('/dialogs', {
    headers: {
      'token': window.localStorage.token 
    }
  }),
  createDialog: (myId, partnerId, DiffieHallmanData) => axios.post('/dialogs', {
    author: myId,
    partner: partnerId,
    DiffieHallmanData
  },
  {
    headers: {
      'token': window.localStorage.token 
    }
  }),
  deleteDialog: (dialogId) => axios.delete(`/dialogs/${dialogId}`,
  {
    headers: {
      'token': window.localStorage.token 
    }
  })
}

export const messagesAPI = {
  sendMessage: (text, dialog) => axios.post('/messages/', {
    text,
    dialog
  },
  {
    headers: {
      'token': window.localStorage.token 
    }
  }),
  getAllByDialogId: id => axios.get(`/messages/${id}`)
}

export const userAPI = {
  login: postData => axios.post('/user/login', postData),
  find: (value, isOnline = null) => axios.get(`/user/find?query=${value}${isOnline !== null ? `&online=${isOnline}` : ''}`, {
    headers: {
      'token': window.localStorage.token 
    }
  }),
  getMe: token => axios.get('/user/me', {
    headers: {
      'token': token 
    }
  }),
  register: postData => axios.post('/user/registration', postData),
}