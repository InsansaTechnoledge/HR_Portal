import React, { useContext } from "react";
import axios from 'axios';
import API_BASE_URL from '../config'
import { userContext } from "./userContext";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
    const { setUser } = useContext(userContext);
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            console.log("Logging out...");
        
            const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, null, {
                withCredentials: true,
            });
        
            if (response.status === 201) {
                setUser(null);
            } else {
                console.error("Logout failed:", response.data.message || response.statusText);
                alert("Logout failed. Please try again");
            }
        
        } catch (error) {
            console.error("Logout error:", error);
            alert("An error occurred during logout.");
        }
    };

    return { handleLogout };
};

export default useLogout;


// try {
//     console.log("Logging out...");

//     const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, null, {
//         withCredentials: true,
//     });

//     if (response.status === 201) {
//         setUser(null);
//     } else {
//         console.error("Logout failed:", response.data.message || response.statusText);
//         alert("Logout failed. Please try again");
//     }

// } catch (error) {
//     console.error("Logout error:", error);
//     alert("An error occurred during logout.");
// }