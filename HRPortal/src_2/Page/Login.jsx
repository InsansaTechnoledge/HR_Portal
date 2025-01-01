import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../Context/userContext';
import LoginForm from '../Components/Form/LoginForm';

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const {setUser} = useContext(userContext);

    const handleLogin = async (userEmail, password) => {
        try {
            // Make a POST request to the backend
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                userEmail,
                password,
            }, { withCredentials: true });
    
            if(response.status===200){
                setUser(response.data.user);
            }

            navigate('/')
            
        } catch (error) {
            setErrorMessage('Login failed. Please check your credentials.');
            console.error(error.response?.data || error.message); 
        }
    };
    
    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-2 py-2 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h1 className="mt-10 text-center text-4xl/6 font-bold tracking-tight text-gray-900">
                    Sign in to your account
                </h1>
            </div>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <LoginForm handleLogin={handleLogin} errorMessage={errorMessage}/>
            </div>
        </div>
    );
};

export default Login;
