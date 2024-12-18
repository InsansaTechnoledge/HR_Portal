import React, { createContext, useState } from 'react';

const userContext = createContext(null);

const UserProvider = ({ children }) => {
    const [user, setUser] = useState();

    return (
        <userContext.Provider value={{user,setUser}}>
            {children}
        </userContext.Provider>
    )
}

export default UserProvider
export {userContext}