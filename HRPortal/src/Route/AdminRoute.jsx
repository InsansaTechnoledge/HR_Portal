import React, { useContext } from 'react'
import { userContext } from '../Context/userContext'
import { Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const {user} = useContext(userContext);
    return (
    user && user.role !== 'user' ? <Outlet /> : <Navigate to='/' replace />
  )
}

export default AdminRoute;