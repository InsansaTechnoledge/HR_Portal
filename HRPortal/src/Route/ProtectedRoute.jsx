import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        // If there is no token, redirect to the login page
        return <Navigate to="/" />;
    }

    // If there is a token, allow access to the protected component
    return children;
};

export default ProtectedRoute;
