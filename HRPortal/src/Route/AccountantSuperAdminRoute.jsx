import React, { useContext } from 'react'
import { userContext } from '../Context/userContext'

function AccountantSuperAdminRoute({children}) {
  const {user} = useContext(userContext);
    return (
    user && user.role==='superAdmin' || user.role==='accountant' ? children : <Navigate to='/' replace/>
  )
}

export default AccountantSuperAdminRoute