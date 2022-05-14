import React, {useState, useEffect} from 'react'
import { connect } from 'react-redux'
import Sidebar from '../components/Sidebar'
import { dialogsActions, userActions, currentDialogActions } from '../redux/actions'
import { userAPI } from '../utils/api'
import withRouter from '../hooks/withRouter'
import DiffieHallman from '../utils/helpers/DiffieHallman'
import openNotification from '../utils/helpers/openNotification'

const SidebarContainer = ({createDialog, addDialog, clearUserData, clearCurrentDialog, clearDialogs, history, user: { socket, data: me }}) => {

  const [usersSearchState, setUsersSearchState] = useState({
    data: [],
    fetching: false,
    value: undefined,
  }) 
  const [modalState, setModalState] = useState({
    visible: false, 
    confirmLoading: false
  })

  const [DiffieHallmanData, setDiffieHallmanData] = useState()

  useEffect(() => {
    const dialogAcceptedHandler = ({dialog, B}) => { 
      if(me.id === dialog.author.id) {
        
        const k = DiffieHallman.finish({B, a: DiffieHallmanData.a, p: DiffieHallmanData.p})
        addDialog(dialog, null, k)
      }
    }
    socket.on('SERVER:DIALOG_ACCEPTED', dialogAcceptedHandler)
  
    return () => {
      socket.removeListener('SERVER:DIALOG_ACCEPTED', dialogAcceptedHandler)
    }
  }, [DiffieHallmanData, socket, addDialog, me])

  const usersHandleSearch = value => {
    if (value) {
      setUsersSearchState({...usersSearchState, fetching: true})
      userAPI.find(value, true).then((response) => {
        if(response.status === 200){
          setUsersSearchState({...usersSearchState, fetching: false, data: response.data})
        }
      }).catch(() => {
        setUsersSearchState({...usersSearchState, fetching: false})
      });
    } else {
      
      setUsersSearchState({...usersSearchState, data: []})
    }
  };

  const usersHandleChange = value => {
    setUsersSearchState({...usersSearchState, value})
  };

  const showModal = () => {
    setModalState({...modalState, visible: true});
  };

  const modalHandleOk = () => {
    if(usersSearchState.value){
      setModalState({...modalState, confirmLoading: true})
      const { g, p, a, A } = DiffieHallman.init()
      setDiffieHallmanData({ g, p, a, A })
      createDialog(usersSearchState.value, { g, p, A }).then(() => {
        setModalState({visible: false, confirmLoading: false})
        setUsersSearchState({
          data: [],
          fetching: false,
          value: undefined,
        })
      })
      .catch(err => {
        console.error(err)
        openNotification({text: err.response.data.message, title: 'Упс', type: 'error'})
      })  
    }
  };

  const modalHandleCancel = () => {
    setModalState({...modalState, visible: false});
  };

  const logout = () => {
    clearUserData()
    clearCurrentDialog()
    clearDialogs()
    history('/login')
  }

  return (
    <Sidebar 
      showModal={showModal} 
      modalHandleCancel={modalHandleCancel} 
      modalHandleOk={modalHandleOk} 
      modalState={modalState} 
      usersHandleSearch={usersHandleSearch}
      usersHandleChange={usersHandleChange} 
      usersSearchState={usersSearchState}
      logout={logout}
    />
  );
};

export default connect((state) =>  state, 
  {
    ...dialogsActions, 
    ...userActions, 
    ...currentDialogActions
  }
)(withRouter(SidebarContainer));