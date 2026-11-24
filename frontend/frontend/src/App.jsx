
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';

import About from './Componets/About';
import Home from './Componets/Home';
import ITTicketPortal from './Componets/ITTicketPortal';
import Login from './Componets/Login';
import Navbar from './Componets/Navbar';
import PasswordReset from './Componets/PasswordReset';
import PasswordResetRequest from './Componets/PasswordResetRequest';
import Register from './Componets/Register';
import Users from './Componets/Users';
import ProtectedRoute from './Componets/Forms/ProjectedRoutes';

function App() {
    const location = useLocation();

    // Pages that should not display the navbar
    const noNavbar =
        location.pathname === '/' ||
        location.pathname === '/register' ||
        location.pathname.includes('password');

    return (
        <>
            {noNavbar ? (
                <Routes>
                    {/* Authentication pages */}
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Password reset pages */}
                    <Route
                        path="/request/password_reset"
                        element={<PasswordResetRequest />}
                    />

                    <Route
                        path="/password-reset/:token"
                        element={<PasswordReset />}
                    />
                </Routes>
            ) : (
                <Navbar
                    content={
                        <Routes>
                            {/* Protected application pages */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/home" element={<Home />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/tickets" element={<ITTicketPortal />} />
                                <Route path="/users" element={<Users />} />
                            </Route>
                        </Routes>
                    }
                />
            )}
        </>
    );
}

export default App;
