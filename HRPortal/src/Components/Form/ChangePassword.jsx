import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { userContext } from '../../Context/userContext';
import SuccessToast from '../Toaster/SuccessToaser';
import ErrorToast from '../Toaster/ErrorToaster';

const ChangePassword = () => {
  const { user } = useContext(userContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastSuccessMessage, setToastSuccessMessage] = useState('');
  const [toastErrorMessage, setToastErrorMessage] = useState('');
  const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
  const [toastErrorVisible, setToastErrorVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setToastErrorMessage("New password and confirm password don't match.");
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3500);
      return;
    }

    try {
      axios.defaults.withCredentials = true;
      console.log("User ID:", user.userId);
      const response = await axios.put(`${API_BASE_URL}/api/user/changePassword/${user._id}`, {
        userEmail: user.userEmail,
        currentPassword,
        newPassword,
      });

      if (response.status === 200) {
        setToastSuccessMessage('Password changed successfully!');
        setToastSuccessVisible(true);
        setTimeout(() => setToastSuccessVisible(false), 3500);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setToastErrorMessage(error.response?.data?.message || 'An error occurred.');
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3500);
    }
  };

  return (
    <div className="mt-6">
      {toastSuccessVisible && <SuccessToast message={toastSuccessMessage} />}
      {toastErrorVisible && <ErrorToast error={toastErrorMessage} />}
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Current Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-lg"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-lg"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Confirm New Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded-lg"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
