// import React from 'react'

// const Login = () => {

//     const handleLogin = () => {
//         alert("login");
//     }

//     return (
//         <>
//             <div className="flex min-h-full flex-1 flex-col justify-center px-2 py-2 lg:px-8">
//                 <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    
//                     <h1 className="mt-10 text-center text-4xl/6 font-bold tracking-tight text-gray-900">
//                         Sign in to your account
//                     </h1>
//                 </div>

//                 <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
//                     <form className="space-y-6">
//                         <div className>
//                             <div className='flex items-center justify-between'>
//                                 <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
//                                     Email address
//                                 </label>
//                             </div>
//                             <div className="mt-2">
//                                 <input
//                                     id="email"
//                                     name="email"
//                                     type="email"
//                                     required
//                                     autoComplete="email"
//                                     className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <div className="flex items-center justify-between">
//                                 <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
//                                     Password
//                                 </label>
//                             </div>
//                             <div className="mt-2">
//                                 <input
//                                     id="password"
//                                     name="password"
//                                     type="password"
//                                     required
//                                     autoComplete="current-password"
//                                     className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <button
//                                 type="button"
//                                 className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//                             >
//                                 Sign in
//                             </button>
//                         </div>
//                     </form>

                    
//                 </div>
//             </div>
//         </>
//     )
// }

// export default Login;

import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [userEmail, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        try {
            // Make a POST request to the backend
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                userEmail,
                password,
            }, { withCredentials: true }); // Enable cookies for session management
    
            // Handle successful login
            alert('Login successful!');
            console.log(response.data); // Debugging
    
            // Redirect to home/dashboard (adjust this URL based on your routing)
            window.location.href = '/home'; // Or use React Router if it's a SPA: history.push('/') or navigate('/')
            
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
