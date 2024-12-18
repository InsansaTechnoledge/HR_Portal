import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userContext } from '../Context/userContext';
import Login from '../Components/Login/Login';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation();
    const navigate = useNavigate(); // Add useNavigate hook
    const {user, setUser} = useContext(userContext);

    console.log("PROT",user);
    return (user ? children : <Navigate to='/' replace/>)

    useEffect(() => {
        const checkSession = async () => {
            try {
                console.log(children.path);
                const response = await axios.get(`http://localhost:3000/api/auth/checkSession`, { withCredentials: true });

                if (response.status === 200) {
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    setIsAuthenticated(false);
                    localStorage.removeItem('user');
                    // Redirect immediately if not authenticated
                    navigate('/', { replace: true, state: { from: location } });
                }
            } catch (error) {
                setIsAuthenticated(false);
                localStorage.removeItem('user');
                // Redirect immediately on error
                navigate('/', { replace: true, state: { from: location } });
            }
        };

        checkSession();
    }, [navigate, location]); // Add navigate and location as dependencies

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; // No need to navigate here as it's handled in useEffect
    }

    return children;
};

export default ProtectedRoute;