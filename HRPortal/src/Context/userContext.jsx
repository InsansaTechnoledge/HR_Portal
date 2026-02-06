import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

const userContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const respone = await axios.get(
          `${API_BASE_URL}/api/auth/checkCookies`,
          {
            withCredentials: true,
          }
        );
        setUser(respone.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <userContext.Provider value={{ user, setUser, loading }}>
      {children}
    </userContext.Provider>
  );
};

export default UserProvider;
export { userContext };
