import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { userContext } from '../Context/userContext';
import Loader from '../Components/Loader/Loader';
import { PencilIcon } from 'lucide-react';
import ErrorToast from '../Components/Toaster/ErrorToaster.jsx'
import SuccessToast from '../Components/Toaster/SuccessToaser.jsx'

const UserProfile = () => {
  const { user } = useContext(userContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUserName, setEditedUserName] = useState('');
  const [editedUserEmail, setEditedUserEmail] = useState('');
  const [toastSuccessMessage, setToastSuccessMessage] = useState('');
  const [toastErrorMessage, setToastErrorMessage] = useState('');
  const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
  const [toastErrorVisible, setToastErrorVisible] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUserName(userData.userName);
    setEditedUserEmail(userData.userEmail);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.put(`${API_BASE_URL}/api/user/profile/${user._id}`, {
        userName: editedUserName,
        userEmail: editedUserEmail,
      });

      if (response.status === 200) {
        setUserData(response.data.user);
        setIsEditing(false);
        setToastSuccessMessage('Profile updated successfully!');
        setToastSuccessVisible(true);
        setTimeout(() => setToastSuccessVisible(false), 3500);
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      setToastErrorMessage(error.response?.data?.message || 'An error occurred.');
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3500);
    }
  };

  useEffect(() => {
  // only run when user is loaded
  if (!user || !user._id) return;
//   console.log(user._id)

  const fetchUserProfile = async (id) => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.get(`${API_BASE_URL}/api/user/profile/${id}`);

      if (response.status === 200) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUserProfile(user._id); 

}, [user]);


  if (loading) {
    return <Loader />;
  }

  if (!userData) {
    return <div>Error loading user profile.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {toastSuccessVisible && <SuccessToast message={toastSuccessMessage} />}
      {toastErrorVisible && <ErrorToast error={toastErrorMessage} />}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{user.role === 'user' ? "User" : "Employee"} Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 font-semibold">Name:</p>
            {isEditing ? (
              <input
                type="text"
                value={editedUserName}
                onChange={(e) => setEditedUserName(e.target.value)}
                className="text-lg border rounded px-2 py-1 w-full"
              />
            ) : (
              <p className="text-lg">{userData.userName}</p>
            )}
          </div>
          <div>
            <p className="text-gray-600 font-semibold">Email:</p>
            {isEditing ? (
              <input
                type="email"
                value={editedUserEmail}
                onChange={(e) => setEditedUserEmail(e.target.value)}
                className="text-lg border rounded px-2 py-1 w-full"
              />
            ) : (
              <p className="text-lg">{userData.userEmail}</p>
            )}
          </div>
          <div>
            <p className="text-gray-600 font-semibold">Role:</p>
            <p className="text-lg">{userData.role}</p>
          </div>
        </div>
        <div className="mt-6">
          {isEditing ? (
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            >
              Edit <PencilIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
