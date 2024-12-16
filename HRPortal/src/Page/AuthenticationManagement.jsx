import React, { useState } from 'react';
import { Trash2, Edit } from 'lucide-react';

const AuthenticationManagement = () => {
    // State for new user form
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        role: 'user',
    });

    // State for existing users
    const [users, setUsers] = useState([
        {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
        },
        {
            id: 2,
            username: 'johndoe',
            email: 'john@example.com',
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
    const handleAddUser = () => {
        if (!newUser.username || !newUser.email) {
            alert('Please fill in all required fields');
            return;
        }

        const isDuplicate = users.some(
            (user) => user.username === newUser.username || user.email === newUser.email
        );

        if (isDuplicate) {
            alert('Username or email already exists');
            return;
        }

        const userToAdd = {
            ...newUser,
            id: users.length + 1,
        };

        setUsers((prev) => [...prev, userToAdd]);
        setNewUser({
            username: '',
            email: '',
            role: 'user',
        });
    };

    // Delete user
    const handleDeleteUser = (id) => {
        setUsers((prev) => prev.filter((user) => user.id !== id));
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add User Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-bold mb-4">Add New User</h2>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                value={newUser.username}
                                onChange={handleInputChange}
                                placeholder="Enter username"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={newUser.email}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                key={user.id}
                                className="flex justify-between items-center border p-3 rounded-lg"
                            >
                                <div>
                                    <div className="font-medium text-gray-800">{user.username}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
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
                                        onClick={() => handleDeleteUser(user.id)}
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