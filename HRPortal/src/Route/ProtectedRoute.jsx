// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//         // If there is no token, redirect to the login page
//         return <Navigate to="/" />;
//     }

//     // If there is a token, allow access to the protected component
//     return children;
// };

// export default ProtectedRoute;

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                console.log("in check session");
                
                // Make a request to check if the user is authenticated
                const response = await axios.get('http://localhost:3000/api/auth/check-session', { withCredentials: true });
                if (response.status === 200) {
                    setAuthenticated(true); 
                    setUser(response.data.user); // User is authenticated
                }
            } catch (error) {
                setAuthenticated(false);  // User is not authenticated
            }
        };

        checkSession();
    }, []);

    // While checking authentication, show a loading indicator or nothing
    if (authenticated === null) {
        return <div>Loading...</div>;
    }

    if (!authenticated) {
        // If not authenticated, redirect to login page
        return <Navigate to="/" />;
    }

    // If authenticated, render the children components (protected content)
    return children;
};

export default ProtectedRoute;

