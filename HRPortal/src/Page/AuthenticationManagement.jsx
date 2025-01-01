import React, { useContext, useEffect, useState } from 'react';
import {
    UserPlus,
    Users,
    Edit3,
    Trash2,
    X,
    Check,
    Shield,
    Mail,
    Lock,
    Search,
    Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config';
import { userContext } from '../Context/userContext';
import ErrorToast from '../Components/Toaster/ErrorToaster';
import SuccessToast from '../Components/Toaster/SuccessToaser';
import Loader from '../Components/Loader/Loader';

const AuthenticationManagement = () => {
    const [userForm, setUserForm] = useState({
        userId: null,
        userName: '',
        userEmail: '',
        password: '',
        role: 'user',
    });

    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const { user } = useContext(userContext);
    const [newUserList, setNewUserList] = useState([]);
    const [toastSuccessMessage, setToastSuccessMessage] = useState();
        const [toastErrorMessage, setToastErrorMessage] = useState();
        const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
        const [toastErrorVisible, setToastErrorVisible] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/employee/`);
            if (response.status === 201) {
                const userEmailSet = new Set(users.map((user) => user.userEmail));
                const newUsers = response.data.employees.filter(
                    (emp) => !userEmailSet.has(emp.email)
                );
                setNewUserList(newUsers);
                if (newUsers.length) {
                    setUserForm((prev) => ({
                        ...prev,
                        userName: newUsers[0].name,
                        userEmail: newUsers[0].email,
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/user/`);
            if (response.status === 200) {
                const validUsers = response.data.filter(
                    (user) => user && user.userId && user.userName && user.userEmail
                );
                setUsers(validUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!userForm.userName || !userForm.userEmail) {
            // alert('Please fill in all required fields');
            setToastErrorMessage("Please fill all details");
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
            return;
        }

        setLoading(true); // Start loading
        try {
            if (userForm.userId) {
                if (user.role === 'superAdmin') {
                    const payload = {
                        userEmail: userForm.currentEmail || userForm.userEmail,
                        currentPassword: prompt('Enter current password to confirm changes:'),
                        newEmail: userForm.userEmail,
                        newPassword: userForm.password,
                    };
                    const response = await axios.put(
                        `${API_BASE_URL}/api/user/edit-login-info`,
                        payload
                    );

                    if (response.status === 200) {
                        // alert(response.data.message);
                        setToastSuccessMessage(response.data.message);
                    setToastSuccessVisible(true);
                    setTimeout(() => setToastSuccessVisible(false), 3500);
                        setUsers((prev) =>
                            prev.map((user) =>
                                user.userId === userForm.userId
                                    ? { ...user, userName: userForm.userName, userEmail: userForm.userEmail }
                                    : user
                            )
                        );
                    }
                } else {
                    if (!userForm.password) {
                        // alert('Password is required!');
                        setToastErrorMessage('Password is required!');
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
                        return;
                    }
                    const response = await axios.put(
                        `${API_BASE_URL}/api/user/changePassword/${userForm.userId}`,
                        { newPassword: userForm.password }
                    );

                    if (response.status === 200) {
                        // alert(response.data.message);
                        setToastSuccessMessage(response.data.message);
                    setToastSuccessVisible(true);
                    setTimeout(() => setToastSuccessVisible(false), 3500);
                    }
                }
            } else {
                const response = await axios.post(`${API_BASE_URL}/api/user/createUser`, userForm);
                // alert(response.data.message);
                setToastSuccessMessage(response.data.message);
                    setToastSuccessVisible(true);
                    setTimeout(() => setToastSuccessVisible(false), 3500);
                setUsers((prev) => [...prev, response.data.new_user]);
            }

            resetForm();
            setModalOpen(false);
        } catch (error) {
            // alert(`Error: ${error.response?.data?.message || error.message}`);
            setToastErrorMessage(`Error: ${error.response?.data?.message || error.message}`);
                setToastErrorVisible(true);
                setTimeout(() => setToastErrorVisible(false), 3500);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const resetForm = () => {
        setUserForm({
            userId: null,
            userName: '',
            userEmail: '',
            password: '',
            role: 'user',
        });
    };

    const handleEditUser = (u) => {
        setUserForm({
            userId: u.userId,
            userName: u.userName,
            userEmail: u.userEmail,
            password: '',
            role: u.role,
            currentEmail: u.userEmail,
        });
        setModalOpen(true);
    };

    const handleDeleteUser = async (id) => {
        setLoading(true); // Start loading
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/user/delete/${id}`);
            if (response.status === 200) {
                setUsers((prev) => prev.filter((user) => user.userId !== id));
                // alert(response.data.message);
                setToastSuccessMessage(response.data.message);
                    setToastSuccessVisible(true);
                    setTimeout(() => setToastSuccessVisible(false), 3500);
                setDeleteConfirmation(null);
            }
        } catch (error) {
            // alert(`Error deleting user: ${error.response?.data?.message || error.message}`);
            setToastSuccessMessage(`Error deleting user: ${error.response?.data?.message || error.message}`);
                    setToastSuccessVisible(true);
                    setTimeout(() => setToastSuccessVisible(false), 3500);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'superAdmin':
                return 'bg-yellow-100 text-yellow-800';
            case 'accountant':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    const setEmailHandler = (newUser) => {
        setUserForm((prev) => ({
            ...prev,
            userEmail: newUser.email,
        }));
    };

    if(loading){
        return(
            <Loader/>
        )
    }

    return (
        <>
        {
            toastSuccessVisible ? <SuccessToast message={toastSuccessMessage}/> : null
        }
        {
            toastErrorVisible ? <ErrorToast error={toastErrorMessage}/> : null
        }
        <div className="min-h-screen bg-gray-50 p-8">
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold flex items-center">
                        <Shield className="mr-4 text-blue-600" size={40} />
                        Authentication Management
                    </h1>
                    <button
                        onClick={() => {
                            setModalOpen(true);
                            fetchEmployees();
                        }}
                        disabled={loading} // Disable button while loading
                        className={`flex items-center px-4 py-2 rounded-lg transition ${loading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <UserPlus className="mr-2" />}
                        Add User
                    </button>
                </header>

                {/* Search Bar */}
                <div className="flex items-center bg-white shadow-md p-4 rounded-lg mb-6">
                    <Search className="text-gray-400 mr-3" />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 rounded-md px-3 py-2"
                    />
                </div>

                {/* User List */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white shadow-lg rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Users className="mr-2 text-blue-600" /> Existing Users
                        </h2>
                        <div className="h-80 overflow-y-auto pr-2">
                            <AnimatePresence>
                                {filteredUsers.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        No users found
                                    </div>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <motion.div
                                            key={u.userId}
                                            initial={{ opacity: 0, x: -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-4"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-800">{u.userName}</div>
                                                <div className="text-sm text-gray-500 flex items-center">
                                                    <Mail className="mr-2 text-blue-500" size={16} />
                                                    {u.userEmail}
                                                </div>
                                                <div className={`text-xs px-2 py-1 rounded mt-2 ${getRoleColor(u.role)}`}>
                                                    {u.role.toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                {(user.role === 'superAdmin' || (user.role === 'admin' && u.role !== 'superAdmin')) && (
                                                    <button
                                                        onClick={() => handleEditUser(u)}
                                                        className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 transition"
                                                    >
                                                        <Edit3 />
                                                    </button>
                                                )}
                                                {user.role === 'superAdmin' && (
                                                    <button
                                                        onClick={() => setDeleteConfirmation(u.userId)}
                                                        disabled={loading} // Disable button while loading
                                                        className={`bg-red-100 text-red-600 p-2 rounded-md transition ${loading
                                                            ? 'cursor-not-allowed'
                                                            : 'hover:bg-red-200'
                                                            }`}
                                                    >
                                                        {loading ? <Loader className="animate-spin" size={16} /> : <Trash2 />}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* User Statistics */}
                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Lock className="mr-2 text-blue-600" /> User Statistics
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Total Users</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {users.length}
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Admin Users</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {users.filter((user) => user.role === 'admin').length}
                                </div>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Super Admin Users</div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {users.filter((user) => user.role === 'superAdmin').length}
                                </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Accountant Users</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {users.filter((user) => user.role === 'accountant').length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Modals */}
                <AnimatePresence>
                    {modalOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white p-8 rounded-xl shadow-2xl w-96"
                            >
                                <h2 className="text-xl font-bold mb-3 text-center">
                                    {userForm.userId ? 'Edit User' : 'Add New User'}
                                </h2>
                                {newUserList.length === 0 && !userForm.userId ? (
                                    <p className="text-red-500 text-center mb-5">
                                        No employees available to add.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                            {userForm.userId ? (
                                                <input
                                                    name="userName"
                                                    value={userForm.userName}
                                                    onChange={handleInputChange}
                                                    disabled={user.role !== 'superAdmin'}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <select
                                                    name="userName"
                                                    onChange={(e) => {
                                                        const newUser = newUserList.find(
                                                            (u) => u.name === e.target.value
                                                        );
                                                        setEmailHandler(newUser);
                                                        handleInputChange(e);
                                                    }}
                                                    value={userForm.userName}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {newUserList.map((newUser) => (
                                                        <option key={newUser.email} value={newUser.name}>
                                                            {newUser.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                name="userEmail"
                                                type="email"
                                                value={userForm.userEmail}
                                                onChange={handleInputChange}
                                                disabled={!userForm.userId}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                            <input
                                                name="password"
                                                type="password"
                                                value={userForm.password}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                            <select
                                                name="role"
                                                value={userForm.role}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="accountant">Accountant</option>
                                                {user.role === 'superAdmin' && (
                                                    <option value="superAdmin">Super Admin</option>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                )}
                                <div className="flex space-x-4 mt-6">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!userForm.userId && newUserList.length === 0}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        {userForm.userId ? 'Update User' : 'Add User'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setModalOpen(false);
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {deleteConfirmation && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-white p-6 rounded-xl shadow-2xl"
                            >
                                <h3 className="text-xl font-bold mb-4 text-center">Confirm Delete</h3>
                                <p className="text-center mb-6">Are you sure you want to delete this user?</p>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={() => handleDeleteUser(deleteConfirmation)}
                                        className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                                    >
                                        <Check className="mr-2" /> Confirm
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirmation(null)}
                                        className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        <X className="mr-2" /> Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
        </>
    );
};

export default AuthenticationManagement;

