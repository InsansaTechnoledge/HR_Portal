import React, { useContext } from 'react'
import { userContext } from '../Context/userContext'
import { Navigate, Outlet } from 'react-router-dom';

const SuperAdminRoute = () => {
  const {user} = useContext(userContext);

    return (
    user && user.role==="superAdmin" ? <Outlet /> : <Navigate to='/' replace />
  )
}

export default SuperAdminRoute