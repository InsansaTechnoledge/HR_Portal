import React, { useContext, useState } from 'react';
import axios from 'axios';
import { useNavigate ,useLocation} from 'react-router-dom';
import { userContext } from '../../Context/userContext';

const Login = () => {
    const [userEmail, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    // const from = location.state?.from?.pathname || '/';
    const {user,setUser} = useContext(userContext);

    const handleLogin = async () => {
        try {
            // Make a POST request to the backend
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                userEmail,
                password,
            }, { withCredentials: true });
            

            if(response.status===200){
                setUser(response.data.user);
            }
            else if(response.status===202){
                alert(response.data.message);
            }
            // Handle successful login
            // alert('Login successful!');
            navigate('/')
            // navigate(from, { replace: true });
            // console.log(response.data); // Debugging
            // window.location.href = '/'; 
            
        } catch (error) {
            // Handle errors
            setErrorMessage('Login failed. Please check your credentials.');
            console.error(error.response?.data || error.message); // Show error details in the console
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
                <form
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault(); // Prevent form default submission
                        handleLogin();
                    }}
                >
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm/6 font-medium text-gray-900"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={userEmail}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm/6 font-medium text-gray-900"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                    </div>
                    {errorMessage && (
                        <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                    )}
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
