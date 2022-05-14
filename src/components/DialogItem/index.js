import React, {useState, useEffect} from 'react'
import propTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'
import { format, isToday, parseISO } from 'date-fns'
import IconReaded from '../IconReaded'
import "./DialogItem.scss"
import Avatar from '../Avatar'
import { Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { Popconfirm } from 'antd'
import { dialogsActions } from '../../redux/actions'

const getMessageTime = created_at => {
  if(isToday(parseISO(created_at))){
    return format(new Date(created_at), 'kk:mm')
  }
  return format(new Date(created_at), 'd.MM.yy')
}

 const DialogItem = (
  { 
    id, 
    partner, 
    unreaded, 
    isTyping, 
    lastMessage, 
    user = lastMessage && lastMessage.user, 
    onSelect 
  }) => {
  const userData = useSelector(({user: {data}}) => data)
  const [isMe, setIsMe] = useState(false)
  const dispatch = useDispatch()

  const deleteDialog = () => { 
    dispatch(dialogsActions.deleteDialog(id))
  }

  useEffect(() => {
    if(userData && user){
      setIsMe(userData._id === user._id)
    }
  }, [userData, user])

  const dialogPreview = (isTyping, isMe, lastMessage) => { 
    if(isTyping) return 'печатает...'

    if(!lastMessage) return ''

    return `${ isMe ? 'Вы' : partner.fullname}: ${lastMessage.text}`
  }

  return(
  <div className='dialogs__item-wrapper'>
  <div onClick = {() => {
      onSelect(id)
    }} className = {classNames("dialogs__item", {"dialogs__item--online": partner.isOnline})}>
    <div className='dialogs__item-avatar'>
      <Avatar avatarSrc={partner.avatar} hash={partner._id} username={partner.fullname}/>
    </div>
    <div className="dialogs__item-info">
      <div className="dialogs__item-info-top">
        <b className="dialogs__username">{partner.fullname}</b>
        <span className="dialogs__date">
          {lastMessage && getMessageTime(lastMessage.createdAt)}
        </span>
      </div>
      <div className="dialogs__item-info-bottom">
        <p className="dialogs__text">
          {dialogPreview(isTyping, isMe, lastMessage)}
        </p>
      </div>
      {isMe ? <IconReaded className="dialogs__readed-icon" isReaded = {lastMessage && lastMessage.isReaded} /> : ''}
      {(!isMe && unreaded) ? <div className="dialogs__count">{unreaded}</div> : ''}
    </div>
  </div>
  <Popconfirm
    title="Вы уверены, что хотите удалить этот диалог?"
    onConfirm={deleteDialog}
    okText="Да"
    cancelText="Нет"
  >
  <Button 
    className="ant-btn--no-border dialogs__delete-dialog" 
    form="circle" 
    icon={<DeleteOutlined style={{ fontSize: '18px'}}/>}
  />
  </Popconfirm>
  </div>
)}

DialogItem.propTypes = {
  id: propTypes.string, 
  partner: propTypes.object, 
  unreaded: propTypes.number, 
  isTyping: propTypes.bool, 
  lastMessage: propTypes.object, 
  user: propTypes.object, 
  onSelect: propTypes.func
}

export default DialogItem