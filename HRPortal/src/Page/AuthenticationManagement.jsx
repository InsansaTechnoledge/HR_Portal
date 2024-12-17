import React, { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import API_BASE_URL from '../config';
import axios from 'axios';

const AuthenticationManagement = () => {
    // State for new user form
    const [newUser, setNewUser] = useState({
        userName: '',
        userEmail: '',
        password: '',
        role: 'user',
    });

    // State for existing users
    const [users, setUsers] = useState([
        {
            userId: 1,
            userName: 'admin',
            userEmail: 'admin@example.com',
            role: 'admin',
        },
        {
            userId: 2,
            userName: 'johndoe',
            userEmail: 'john@example.com',
            role: 'user',
        },
    ]);

    // Handle input changes for new user form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Add new user
    const handleAddUser = async () => {
        if (!newUser.userName || !newUser.userEmail) {
            alert('Please fill in all required fields');
            return;
        }

        const isDuplicate = users.some(
            (user) => user.userName === newUser.userName || user.userEmail === newUser.userEmail
        );

        if (isDuplicate) {
            alert('Username or email already exists');
            return;
        }

        console.log(newUser)
        const response = await axios.post(`${API_BASE_URL}/api/user/signup`,newUser, {
          headers: {
            'content-type': 'application/json'
          }  
        });

        // if(response.status===200){
            alert(response.data.message)
        // }
        // else/{
            
        // }
        
        

        setUsers((prev) => [...prev, newUser]);
        setNewUser({
            userName: '',
            userEmail: '',
            password: '',
            role: 'user',
        });
    };

    // Delete user
    const handleDeleteUser = async (id) => {
        setUsers((prev) => prev.filter((user) => user.userId !== id));

        const response = await axios(`${API_BASE_URL}/api/user/delete/${id}`)
        if(response.status===200){
            alert(response.data.message);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add User Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-bold mb-4">Add New User</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                name="userName"
                                value={newUser.userName}
                                onChange={handleInputChange}
                                placeholder="Enter username"
                                className="mt-1 block w-full focus:outline-none focus:shadow-md border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="userEmail"
                                type="email"
                                value={newUser.userEmail}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                                className="mt-1 block w-full focus:outline-none focus:shadow-md border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={newUser.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                className="mt-1 block w-full focus:outline-none focus:shadow-md border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={newUser.role}
                                onChange={handleInputChange}
                                className="mt-1 block w-full focus:outline-none focus:shadow-md border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleAddUser}
                        className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    >
                        Add User
                    </button>
                </div>

                {/* Existing Users Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-bold mb-4">Existing Users</h2>
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div
                                key={user.userId}
                                className="flex justify-between items-center border p-3 rounded-lg"
                            >
                                <div>
                                    <div className="font-medium text-gray-800">{user.userName}</div>
                                    <div className="text-sm text-gray-500">{user.userEmail}</div>
                                    <div className="text-xs text-gray-500 capitalize">Role: {user.role}</div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        className="bg-gray-100 text-gray-700 p-2 rounded-md hover:bg-gray-200"
                                        onClick={() => alert('Edit functionality not implemented')}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        className="bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200"
                                        onClick={() => handleDeleteUser(user.userId)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <div className="text-center text-gray-500">No users found</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthenticationManagement;