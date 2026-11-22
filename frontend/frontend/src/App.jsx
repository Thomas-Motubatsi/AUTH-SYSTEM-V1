import './App.css'
import Home from './Componets/Home'
import Login from './Componets/Login'
import Navbar from './Componets/Navbar'
import Register from './Componets/Register'
import About from './Componets/About'
import { Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from './Componets/Forms/ProjectedRoutes'
import PasswordResetRequest from './Componets/PasswordResetRequest'
import PasswordReset from './Componets/PasswordReset'
import ITTicketPortal from './Componets/ITTicketPortal'

function App() {
 
  const location=useLocation()
  const noNavbar = location.pathname === "/register" || location.pathname === "/" || location.pathname.includes("password")
  return (
    <>

      {
        noNavbar?
          <Routes>
            <Route path='/' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/request/password_reset' element={<PasswordResetRequest/>} />
            <Route path='/password-reset/:token' element={<PasswordReset/>} />
          </Routes>
          : 

        <Navbar
        content={
          <Routes>
            <Route element={<ProtectedRoute/>}>
                <Route path='/home' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/tickets' element={<ITTicketPortal />} />
                 
            </Route>
          </Routes>
        }
      />

      }


      
      
    </>
  )
}

export default App
