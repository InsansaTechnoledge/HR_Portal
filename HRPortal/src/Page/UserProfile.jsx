import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { userContext } from '../Context/userContext';
import Loader from '../Components/Loader/Loader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {format} from 'date-fns';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2, 
  Briefcase,
  Edit,
  Camera,
  Shield,
  Award,
  ContactRound
} from 'lucide-react';
import ErrorToast from '../Components/Toaster/ErrorToaster.jsx'
import SuccessToast from '../Components/Toaster/SuccessToaser.jsx'

const UserProfile = () => {
  const { user } = useContext(userContext);
  // const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmp, setIsEmp] = useState(false);
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

  const fetchUserProfile = async (email) => {
    // try {
    //   axios.defaults.withCredentials = true;
    //   const response = await axios.get(`${API_BASE_URL}/api/user/profile/${id}`);

    //   if (response.status === 200) {
    //     setUserData(response.data.user);
    //   }
    // } catch (error) {
    //   console.error("Error fetching user profile:", error);
    // } finally {
    //   setLoading(false);
    // }
      try {
        // Try employee API first
        const empResp = await axios.get(
          `${API_BASE_URL}/api/employee/fetchEmployeeByEmail/${user.userEmail}`
        );

        if (empResp.status === 200 && empResp.data) {
          setProfileData(empResp.data);
          setIsEmp(true);
          return; //STOP here
        }
      } catch (empError) {
        // Employee not found → try candidate
        if (empError.response?.status !== 404) {
          console.error('Employee API error:', empError);
        }
      }
      try {
        // Fallback to candidate API
        const candResp = await axios.get(
          `${API_BASE_URL}/api/candidate/${user.userEmail}`
        );

        if (candResp.status === 200 && candResp.data) {
          setProfileData(candResp.data);
          setIsEmp(false);
        }
      } catch (candError) {
        console.error('Candidate API error:', candError);
      }
    };
    fetchUserProfile(user.userEmail); 

}, [user?.userEmail]);

const userData  = {
    personalInfo: [
      // { icon: ContactRound, label: 'Name', value: profileData && profileData.name ? profileData.name  : ' - ' },
      { icon: Mail, label: 'Email', value: profileData && profileData.email ? profileData.email  : ' - ' },
      { icon: Phone, label: 'Phone', value: profileData && profileData?.details?.phone ? profileData?.details?.phone  : profileData.contact_no},
      { icon: MapPin, label: 'Address', value: profileData && profileData?.details?.city ? profileData?.details?.city  : ' - '  },
      { icon: Calendar, label: 'Date of Birth', value: profileData?.details?.dateOfBirth ? format(new Date(profileData.details.dateOfBirth), 'dd-MM-yyyy') : ' - ' },
    ],
    workInfo: [
      { icon: Building2, label: 'Department', value: profileData && profileData.department ? profileData.department : ' - ' },
      { icon: Briefcase, label: 'Position', value: profileData && profileData?.details?.designation ? profileData?.details?.designation : profileData.technology},
      { icon: Calendar, label: 'Join Date', value: ' - ' },
      { icon: Shield, label: 'Role', value: user && user.role === 'superAdmin' ? 'Super Admin' : isEmp ? "Employee" : (user.role === 'user' ? "User" : "Accountant") },
    ],
  };

  // if (loading) {
  //   return <Loader />;
  // }

  if (!profileData) {
    return <div>Error loading user profile.</div>;
  }

  return (
      <div className="min-h-screen bg-background p-4 lg:p-8">
      {toastSuccessVisible && <SuccessToast message={toastSuccessMessage} />}
      {toastErrorVisible && <ErrorToast error={toastErrorMessage} />}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary via-hr-teal to-info" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl bg-card border-4 border-card shadow-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary">
                    {user && profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                {/* <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-lg text-primary-foreground shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button> */}
              </div>
              <div className="flex-1 pt-2 sm:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div className='mt-7'>
                    <h1 className="text-2xl font-bold">{user && user.userName ? user.userName : 'User'}</h1>
                    <p className="text-muted-foreground font-semibold">{profileData?.details?.designation ? profileData?.details.designation : 'Intern'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {/* <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        Active
                      </span> */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        <Award className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  </div>
                  {/* <Button className="gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button> */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData.personalInfo.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                  <div className="p-2 rounded-lg bg-background">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Work Information */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData.workInfo.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                  <div className="p-2 rounded-lg bg-background">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium capitalize">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        {/* <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Contact Name</label>
                <Input value="Jane Doe" readOnly className="mt-1.5 bg-secondary/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Relationship</label>
                <Input value="Spouse" readOnly className="mt-1.5 bg-secondary/50" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Phone Number</label>
                <Input value="+1 (555) 987-6543" readOnly className="mt-1.5 bg-secondary/50" />
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default UserProfile;
