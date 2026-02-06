import React, { useState } from 'react';

function LoginForm(props) {
    const [userEmail, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div>
            <form
                className="space-y-6"
                onSubmit={(e) => {
                    e.preventDefault(); // Prevent form default submission
                    props.handleLogin(userEmail, password);
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
                {props.errorMessage && (
                    <p className="text-red-500 text-sm mt-2">{props.errorMessage}</p>
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
    );
}

export default LoginForm;
