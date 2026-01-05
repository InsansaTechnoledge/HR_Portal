import React, { useContext } from 'react'
import { userContext } from '../Context/userContext'
import { Navigate } from 'react-router-dom';

const NoSuperAdminRoute = () => {
  const {user} = useContext(userContext);
    return (
    user && user.role !== 'superAdmin' ? <Outlet /> : <Navigate to='/' replace />
  )
}

export default NoSuperAdminRoute;