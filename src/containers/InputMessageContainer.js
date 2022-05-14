import React from 'react';
import { connect } from 'react-redux'
import InputMessage from '../components/MessageInput'
import { currentDialogActions } from '../redux/actions'
import openNotification from '../utils/helpers/openNotification';


const InputMessageContainer = ({me, dialogId, socket, sendMessage, addMessage }) => {
  
  const handleTyping = () => {
    socket.emit('MESSAGE_TYPING', {user: me, dialogId})
  }
  const inputSubmitHandler = (value) => {
    if(dialogId){
      
      sendMessage(value).then(() => {
        addMessage(
          {
            text: value, 
            isReaded: false, 
            user: me, 
            createdAt: new Date().toISOString(), 
            dialog: {_id: dialogId}
          }
        )
      })
      .catch(err => {
        openNotification({text: err.response.data.message, title: 'Упс', type: 'error'})
      })
    }
  }
    
  return (
    <InputMessage inputSubmitHandler = {inputSubmitHandler} handleTyping={handleTyping}/>
  );
};

export default connect(({user, currentDialog}) =>  (
  {
    me: user.data, 
    socket: user.socket, 
    dialogId: currentDialog.currentDialog
  }),  currentDialogActions)(InputMessageContainer);