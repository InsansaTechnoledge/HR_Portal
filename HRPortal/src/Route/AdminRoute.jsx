import React, { useContext } from 'react'
import { userContext } from '../Context/userContext'
import { Navigate } from 'react-router-dom';

const AdminRoute = ({children}) => {
  const {user} = useContext(userContext);
    return (
    user && user.role !== 'user' ? children : <Navigate to='/' replace />
  )
}

export default AdminRoute;