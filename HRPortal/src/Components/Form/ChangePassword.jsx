import React, { useState, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { userContext } from '../../Context/userContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Lock, Key, Shield, Eye, EyeOff } from 'lucide-react';
import SuccessToast from '../Toaster/SuccessToaser';
import ErrorToast from '../Toaster/ErrorToaster';

const ChangePassword = () => {
  const { user } = useContext(userContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toastSuccessMessage, setToastSuccessMessage] = useState('');
  const [toastErrorMessage, setToastErrorMessage] = useState('');
  const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
  const [toastErrorVisible, setToastErrorVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(user);
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
    // <div className="mt-6">
    //   {toastSuccessVisible && <SuccessToast message={toastSuccessMessage} />}
    //   {toastErrorVisible && <ErrorToast error={toastErrorMessage} />}
    //   <h2 className="text-2xl font-bold mb-4">Change Password</h2>
    //   <form onSubmit={handleSubmit}>
    //     <div className="mb-4">
    //       <label className="block text-gray-700">Current Password</label>
    //       <input
    //         type="password"
    //         className="w-full px-3 py-2 border rounded-lg"
    //         value={currentPassword}
    //         onChange={(e) => setCurrentPassword(e.target.value)}
    //         required
    //       />
    //     </div>
    //     <div className="mb-4">
    //       <label className="block text-gray-700">New Password</label>
    //       <input
    //         type="password"
    //         className="w-full px-3 py-2 border rounded-lg"
    //         value={newPassword}
    //         onChange={(e) => setNewPassword(e.target.value)}
    //         required
    //       />
    //     </div>
    //     <div className="mb-4">
    //       <label className="block text-gray-700">Confirm New Password</label>
    //       <input
    //         type="password"
    //         className="w-full px-3 py-2 border rounded-lg"
    //         value={confirmPassword}
    //         onChange={(e) => setConfirmPassword(e.target.value)}
    //         required
    //       />
    //     </div>
    //     <button
    //       type="submit"
    //       className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    //     >
    //       Change Password
    //     </button>
    //   </form>
    // </div>

    <div className="min-h-screen bg-background p-4 lg:p-8">
    {toastSuccessVisible && <SuccessToast message={toastSuccessMessage} />}
    {toastErrorVisible && <ErrorToast error={toastErrorMessage} />}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Change Password</h1>
          <p className="text-muted-foreground">Update your account password</p>
        </div>

        {/* Security Tips */}
        <Card className="border-0 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Password Requirements</p>
                <ul className="text-muted-foreground space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include at least one number</li>
                  <li>• Include at least one special character</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password Form */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Update Password
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="current"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new"
                    type={showNew ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Update Password
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </form>
          
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
