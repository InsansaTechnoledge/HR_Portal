import React, { useContext } from 'react'
import { userContext } from '../Context/userContext'
import { Navigate, Outlet } from 'react-router-dom';

const AccountantSuperAdminRoute = () => {
  const {user} = useContext(userContext);
  return (
    user && (user.role==='superAdmin' || user.role==='accountant') ? <Outlet /> : <Navigate to='/' replace/>
  )
}

export default AccountantSuperAdminRoute