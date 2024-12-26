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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../config';
import { userContext } from '../Context/userContext';
import { useNavigate } from 'react-router-dom';

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
    const { user, setUser } = useContext(userContext)
    const [newUserList,setNewUserList] = useState();

    useEffect(() => {
        fetchUsers();
    }, []);


    const fetchEmployees = async () => {
        const response = await axios.get(`${API_BASE_URL}/api/employee/`);
        if(response.status===201){
            const userEmailSet = new Set(users.map(user => user.userEmail));
            const newUsers = response.data.employees.filter(emp => !userEmailSet.has(emp.email));
            setNewUserList(newUsers);
            console.log("newUser", newUsers);

            setUserForm(prev => ({
                ...prev,
                userName: newUsers[0].name, 
                userEmail: newUsers[0].email
            }))
            console.log(newUsers[0]);
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/user/`);
            if (response.status === 200) {
                // Ensure only valid users are added
                const validUsers = response.data.filter(user =>
                    user &&
                    user.userId &&
                    user.userName &&
                    user.userEmail
                );
                setUsers(validUsers);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]); // Ensure users is always an array
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserForm((prev) => ({ ...prev, [name]: value }));
        console.log(name,value);
    };

    const handleSubmit = async () => {
        if (!userForm.userName || !userForm.userEmail) {
            alert('Please fill in all required fields');
            return;
        }

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
                        alert(response.data.message);
                        setUsers((prev) =>
                            prev.map((user) =>
                                user.userId === userForm.userId
                                    ? { ...user, userName: userForm.userName, userEmail: userForm.userEmail }
                                    : user
                            )
                        );
                    }
                }
                else {
                    if (!userForm.password) {
                        alert("Password is required!");
                    }
                    else {
                        const response = await axios.put(`${API_BASE_URL}/api/user/changePassword/${userForm.userId}`, {
                            newPassword: userForm.password
                        }
                        );

                        if (response.status === 200) {
                            alert(response.data.message);

                        }

                    }
                }
            } else {
                const response = await axios.post(`${API_BASE_URL}/api/user/createUser`, userForm);
                alert(response.data.message);
                setUsers((prev) => [...prev, response.data.new_user]);
            }




            resetForm();
            setModalOpen(false);
        } catch (error) {
            alert(`Error: ${error.response?.data?.message || error.message}`);
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
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/user/delete/${id}`);
            if (response.status === 200) {
                setUsers((prev) => prev.filter((user) => user.userId !== id));
                alert(response.data.message);
                setDeleteConfirmation(null);
            }
        } catch (error) {
            alert(`Error deleting user: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredUsers = users.filter(user =>
        user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'superAdmin': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const setEmailHandler = (newUser) => {
        setUserForm(prev => ({
            ...prev,
            userEmail:newUser.email
        }));
        
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 flex items-center">
                            <Shield className="mr-4 text-blue-600" size={40} />
                            Authentication Management
                        </h1>
                        <p className="text-gray-600 mt-2">Manage user access, roles, and authentication</p>
                    </div>
                    <button
                        onClick={() => {
                            setModalOpen(true)
                            fetchEmployees();
                        }}
                        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <UserPlus className="mr-2" /> Add User
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
                                    filteredUsers
                                        .filter((u) => u && u.userId && u.userName && u.userEmail) // Additional safety check
                                        .map((u) => (
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
                                                    {
                                                        user.role === 'admin' && u.role !== 'superAdmin'
                                                            ?
                                                            <button
                                                                onClick={() => handleEditUser(u)}
                                                                className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 transition"
                                                            >

                                                                <Edit3 />
                                                            </button>
                                                            : null
                                                    }

                                                    {user && user.role === 'superAdmin' && (
                                                        <>
                                                        <button
                                                        onClick={() => handleEditUser(u)}
                                                        className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 transition"
                                                    >

                                                        <Edit3 />
                                                      </button>
                                                        <button
                                                            onClick={() => setDeleteConfirmation(u.userId)}
                                                            className="bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200 transition"
                                                        >
                                                            <Trash2 />
                                                        </button>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                )}
                            </AnimatePresence>
                        </div>

                    </div>


                    <div className="bg-white shadow-lg rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Lock className="mr-2 text-blue-600" /> User Statistics
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Total Users</div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {users.filter(user => user && user.userId).length}
                                </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Admin Users</div>
                                <div className="text-2xl font-bold text-green-600">
                                    {users.filter(user => user.role === 'admin').length}
                                </div>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600">Super Admin Users</div>
                                <div className="text-2xl font-bold text-red-600">
                                    {users.filter(user => user.role === 'superAdmin').length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
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

                {/* Add/Edit User Modal */}
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
                                    {userForm.userId ? (user.role==='admin' ? 'Set New Password' : 'Edit User') : 'Add New User'}
                                </h2>
                                {
                                    !userForm.userId ? <h3 className='mb-5 text-red-500'>Add Employee before registering it as user</h3> : null
                                }
                                {
                                    userForm.userId && user && user.role === 'admin'
                                        ?
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                                <input
                                                    disabled
                                                    name="userName"
                                                    value={userForm.userName}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter username"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                                <input
                                                    name="password"
                                                    type="password"
                                                    required
                                                    value={userForm.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter password"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        :

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                        <select 
                                        name='userName'
                                        onChange={(event) => {
                                            const newUser = newUserList.filter(newU => newU.name==event.target.value);
                                            setEmailHandler(newUser[0])
                                            handleInputChange(event)
                                        }}
                                        value={userForm.userName}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                                            {newUserList && newUserList.map((newUser) => {
                                                return <option value={newUser.name}>{newUser.name}</option>
                                            })}
                                        </select>
                                        {/* <input
                                            name="userName"
                                            value={userForm.userName}
                                            onChange={handleInputChange}
                                            placeholder="Enter username"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        /> */}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            name="userEmail"
                                            type="email"
                                            disabled
                                            value={userForm.userEmail}
                                            onChange={handleInputChange}
                                            placeholder="Enter email"
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
                                            placeholder="Enter password"
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
                                            {
                                                user && user.role == 'superAdmin'
                                                    ?
                                                    <option value="superAdmin">Super Admin</option>
                                                    :
                                                    null
                                            }
                                        </select>
                                    </div>
                                </div>
                                }
                                <div className="flex space-x-4 mt-6">
                                    <button
                                        onClick={handleSubmit}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        {userForm.userId ? (user.role === 'admin' ? 'Change Password' : 'Update User') : 'Add User'}
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
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default AuthenticationManagement;