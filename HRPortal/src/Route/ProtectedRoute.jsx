import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const location = useLocation(); // Get the current location

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/auth/checkSession`, { withCredentials: true });

                if (response.status === 200) {
                    setIsAuthenticated(true);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                } else {
                    setIsAuthenticated(false);
                    localStorage.removeItem('user');
                }
            } catch (error) {
                setIsAuthenticated(false);
                localStorage.removeItem('user');
            }
        };

        checkSession();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    // Redirect to login if not authenticated, preserving the intended location
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;