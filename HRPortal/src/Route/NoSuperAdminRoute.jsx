import React, { useContext } from 'react'
import { userContext } from '../Context/userContext'
import { Navigate } from 'react-router-dom';

const NoSuperAdminRoute = ({children}) => {
  const {user} = useContext(userContext);
    return (
    user && user.role !== 'superAdmin' ? children : <Navigate to='/' replace />
  )
}

export default NoSuperAdminRoute;