import React, {useEffect} from 'react'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Home from './pages/Home'
import { userActions } from './redux/actions'

function App({me, isAuth, token, fetchUserData}) {

  useEffect(() => {
    if(token && !me)
      fetchUserData(token)
  }, [me, token, fetchUserData])
  
  return (
    <div className="wrapper">
      <Router>
        <Routes>
          <Route path='/'>
            <Route index element={isAuth ?  <Navigate to="/im"/> : <Auth/>}/>
            <Route index path='login' element={isAuth ?  <Navigate to="/im"/> : <Auth/>}/>
            <Route path='register' element={isAuth ?  <Navigate to="/im"/> : <Auth/>}/>
            <Route path='im' element={isAuth ? <Home/> : <Navigate to="/login"/>}/>
          </Route> 
        </Routes>
      </Router>
    </div>
  );
}

export default connect(({ user: {isAuth, token, data} }) => ({isAuth, token, me: data}), userActions)(App);
