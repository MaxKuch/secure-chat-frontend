import React from 'react'
import './Auth.scss'
import { FormLogin, RegistrationForm } from '../../modules'
import {  useLocation } from 'react-router-dom'


const Auth = () => {
  const { pathname } = useLocation()
  const Form = pathname === '/login' ? FormLogin : RegistrationForm
  return (
    <div className = "auth">
      <div className = "auth__wrapper">
        <Form />
      </div>
    </div>
  )
}
export default Auth