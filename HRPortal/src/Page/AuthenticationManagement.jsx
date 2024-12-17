import React, { useEffect, useState } from 'react';
import { Trash2, Edit } from 'lucide-react';
import API_BASE_URL from '../config';
import axios from 'axios';

const AuthenticationManagement = () => {
    // State for user form (both add and edit)
    const [userForm, setUserForm] = useState({
        userId: null, // Tracks the ID of the user being edited
        userName: '',
        userEmail: '',
        password: '',
        role: 'user',
    });

    // State for existing users
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await axios.get(`${API_BASE_URL}/api/user/`);
            if (response.status === 200) {
                setUsers(response.data);
            }
        };
        fetchUsers();
    }, []);

    // Handle input changes for the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission (add or edit user)
    const handleSubmit = async () => {
        if (!userForm.userName || !userForm.userEmail) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            if (userForm.userId) {
                // Edit existing user
                const payload = {
                    userEmail: userForm.currentEmail || userForm.userEmail, // Existing email
                    currentPassword: prompt('Enter current password to confirm changes:'), // For security
                    newEmail: userForm.userEmail,
                    newPassword: userForm.password,
                };
                const response = await axios.put(
                    `${API_BASE_URL}/api/user/edit-login-info`,
                    payload
                );

                if (response.status === 200) {
                    alert(response.data.message);
                    setUsers((prev) =>
                        prev.map((user) =>
                            user.userId === userForm.userId
                                ? { ...user, userName: userForm.userName, userEmail: userForm.userEmail }
                                : user
                        )
                    );
                }
            } else {
                // Add new user
                const response = await axios.post(`${API_BASE_URL}/api/user/createUser`, userForm);
                alert(response.data.message);
                setUsers((prev) => [...prev, response.data.new_user]);
            }

            resetForm();
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    // Reset the form
    const resetForm = () => {
        setUserForm({
            userId: null,
            userName: '',
            userEmail: '',
            password: '',
            role: 'user',
        });
    };

    // Handle edit user action
    const handleEditUser = (user) => {
        setUserForm({
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
            password: '',
            role: user.role,
            currentEmail: user.userEmail, // Store current email
        });
    };

    // Delete user
    const handleDeleteUser = async (id) => {
        const response = await axios.delete(`${API_BASE_URL}/api/user/delete/${id}`);
        if (response.status === 200) {
            setUsers((prev) => prev.filter((user) => user.userId !== id));
            alert(response.data.message);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add/Edit User Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-bold mb-4">
                        {userForm.userId ? 'Edit User' : 'Add New User'}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                name="userName"
                                value={userForm.userName}
                                onChange={handleInputChange}
                                placeholder="Enter username"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                name="userEmail"
                                type="email"
                                value={userForm.userEmail}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={userForm.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                name="role"
                                value={userForm.role}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                    >
                        {userForm.userId ? 'Update User' : 'Add User'}
                    </button>
                    {userForm.userId && (
                        <button
                            onClick={resetForm}
                            className="mt-2 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                {/* Existing Users Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-bold mb-4">Existing Users</h2>
                    <div className="space-y-4">
                        {users
                            .filter((user) => user && user.userId && user.userName && user.userEmail) // Validate required fields
                            .map((user) => (
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
                                            onClick={() => handleEditUser(user)}
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

