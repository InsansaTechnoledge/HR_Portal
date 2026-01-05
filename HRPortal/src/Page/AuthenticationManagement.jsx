import React, { useContext, useEffect, useState } from "react";
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
  Key,
  UserCheck,
  UserX,
  Edit,
  Crown,
  ChevronDown
} from "lucide-react";

import {Button} from '../Components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '../Components/ui/card';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogTitle} from '../Components/ui/dialog';
import {Input} from '../Components/ui/input';
import {Label} from '../Components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup} from '../Components/ui/select';

import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import API_BASE_URL from "../config";
import { userContext } from "../Context/userContext";
import ErrorToast from "../Components/Toaster/ErrorToaster";
import SuccessToast from "../Components/Toaster/SuccessToaser";
import Loader from "../Components/Loader/Loader";
import { toast } from "../hooks/useToast";

 const emptyUserForm = {
  userId: null,
  userName: "",
  userEmail: "",
  password: "",
  currentPassword: "",
  role: "user",
};

const AuthenticationManagement = () => {
  const [userForm, setUserForm] = useState({
    emptyUserForm
  });

 
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const { user } = useContext(userContext);
  const [newUserList, setNewUserList] = useState([]);
  const [toastSuccessMessage, setToastSuccessMessage] = useState();
  const [toastErrorMessage, setToastErrorMessage] = useState();
  const [toastSuccessVisible, setToastSuccessVisible] = useState(false);
  const [toastErrorVisible, setToastErrorVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const [roleFilter, setRoleFilter] = useState("all");
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
  if (modalOpen && !userForm.userId) {
    fetchCandidates();
  }
  }, [modalOpen]);

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/candidate/candidates`
      );
      if (response.status === 200) {
        const candidates = Array.isArray(response.data) ? response.data : [];

        // Filter out candidates whose email already exists as a user
        const userEmailSet = new Set(users.map((u) => u.userEmail));
        const available = candidates.filter(
          (c) => c?.email && !userEmailSet.has(c.email)
        );
        setNewUserList(available);

        // Set the first available candidate in the form
        if (available.length > 0) {
          setUserForm((prev) => ({
            ...prev,
            userName: available[0].name || "",
            userEmail: available[0].email || "",
          }));
        }
      }
    } catch (error) {
      toast ({
          variant: "destructive",
          title: "Error",
          description: "Failed to Fetch Candidates",
      });
      console.error("Error fetching candidates:", error);
      setNewUserList([]);
    }
  };

  useEffect(() => {
    const fetchExistingUsers = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/`);
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (err) {
        toast ({
          variant: "destructive",
          title: "Error",
          description: "Failed to Fetch USers.",
        })
        console.error("Error fetching existing users:", err);
        setUsers([]);
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchExistingUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async () => {
  if (!userForm.userName || !userForm.userEmail) {
    toast ({
      title: "Validation Error",
      description:"Please Fill all Details"
    })
    return;
  }

  setLoading(true);
  try {
   
    if (userForm.userId) {
      const payload = {
        userName: userForm.userName,
        userEmail: userForm.userEmail,
      };

        if (userForm.password && userForm.password.trim()) {
          if (!userForm.currentPassword || !userForm.currentPassword.trim()) {
            setToastErrorMessage(
              "Current password is required to change password"
            );
            setToastErrorVisible(true);
            setTimeout(() => setToastErrorVisible(false), 3500);
            setLoading(false);
            return;
          }

          // include both new and current password in the request
          payload.newPassword = userForm.password;
          payload.currentPassword = userForm.currentPassword;
        }

        // Only allow role change from frontend if current user is superAdmin
        if (user.role === "superAdmin") {
          payload.role = userForm.role;
        }

        const response = await axios.put(
          `${API_BASE_URL}/api/user/edit-login-info/${userForm.userId}`,
          payload,
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setToastSuccessMessage(
            response.data.message || "User updated successfully"
          );
          setToastSuccessVisible(true);
          setTimeout(() => setToastSuccessVisible(false), 3500);

          // update local list
          setUsers((prev) =>
            prev.map((existing) =>
              existing._id === userForm.userId ||
              existing.userId === userForm.userId
                ? {
                    ...existing,
                    userName: response.data.user.userName,
                    userEmail: response.data.user.userEmail,
                    role: response.data.user.role,
                    _id: response.data.user._id,
                  }
                : existing
            )
          );
        }
      } else {
        // CREATE NEW USER
        const createPayload = {
          userName: userForm.userName,
          userEmail: userForm.userEmail,
          password:
            userForm.password && userForm.password.trim()
              ? userForm.password
              : `${userForm.userName.toLowerCase().replace(/\s+/g, "")}@123`,
          role: userForm.role || "user",
        };

        const response = await axios.post(
          `${API_BASE_URL}/api/user/createUser`,
          createPayload
        );

        if (response.status === 201 || response.status === 200) {
          setToastSuccessMessage(
            response.data.message || "User created successfully"
          );
          setToastSuccessVisible(true);
          setTimeout(() => setToastSuccessVisible(false), 3500);
          setUsers((prev) => [...prev, response.data.new_user]);
        }
      }

      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error("handleSubmit error:", error);
      setToastErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update user"
      );
      setToastErrorVisible(true);
      setTimeout(() => setToastErrorVisible(false), 3500);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserForm({
      userId: null,
      userName: "",
      userEmail: "",
      password: "",
      currentPassword: "",
      role: "user",
    });
  };

  // Populate form for editing; respects current user's role for allowed fields
  const handleEditUser = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/${id}`);
      if (response.status === 200 && response.data?.user) {
        const u = response.data.user;
        setUserForm({
          userId: u._id || u.userId,
          userName: u.userName || "",
          userEmail: u.userEmail || "",
          password: "",
          role: u.role || "user",
        });
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error loading user for edit:", error);
      toast ({
        variant:"destructive",
        title:"Error",
        description:`Error loading user: ${error.response?.data?.message || error.message}`,
      })
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteUser = async (id) => {
    setLoading(true); // Start loading
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/user/delete/${id}`
      );
      if (response.status === 200) {
        setUsers((prev) => prev.filter((user) => user._id !== id));
        // alert(response.data.message);

        toast ({
          variant:"success",
          title:"User Deleted",
          description:"User Deleted Successfully" || response.data.message,
        })
      }
      setDeleteConfirmation(null);
    } catch (error) {
      // alert(`Error deleting user: ${error.response?.data?.message || error.message}`);
      toast ({
          variant:"destuctive",
          title:"Error Deleting",
          description:"Failed to Delete User" || error.response?.data?.message || error.message,
        })
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Safe search filter to avoid undefined errors
  const filteredUsers = (users || []).filter((u) => {
  const q = (searchQuery || "").toLowerCase();
  const name = (u?.userName || "").toLowerCase();
  const email = (u?.userEmail || "").toLowerCase();

  const matchesSearch = name.includes(q) || email.includes(q);
  const matchesRole =
    roleFilter === "all" ? true : u?.role === roleFilter;

  return matchesSearch && matchesRole;
});

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-hr-purple/10 text-hr-purple border border-hr-purple/20";
      case "superAdmin":
        return "bg-destructive/10 text-destructive border border-destructive/20";
      case "accountant":
        return "bg-blue-100 text-blue-800 border border-blue-900/20";
      default:
        return "bg-hr-amber/10 text-hr-amber border border-hr-amber/20";
    }
  };

  const setEmailHandler = (newUser) => {
    setUserForm((prev) => ({
      ...prev,
      userEmail: newUser.email,
    }));
  };

  // if (loading) {
  //   return <Loader/>;
  // }
  const totalUsers = users.length;

  const superAdmins = users.filter(u => u.role === "superAdmin").length;
  const admins = users.filter(u => u.role === "admin").length;

  // If you don’t have status field → assume all are active
  const activeUsers = users.length;

  return (
    <>
      <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Authentication Management</h1>
            <p className="text-muted-foreground">
              Manage user access and permissions
            </p>
          </div>
          <Button
            onClick={() => {
              setUserForm(emptyUserForm);   // reset form
              setModalOpen(true);           // open dialog
            }}
          >
            + Create Credentials
          </Button>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-primary' },
            { label: 'Super Admins', value: superAdmins, icon: Crown, color: 'text-hr-amber' },
            { label: 'Admins', value: admins, icon: Shield, color: 'text-hr-purple' },
            { label: 'Active Users', value: activeUsers, icon: UserCheck, color: 'text-success' },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Role Filter */}
              <div className="w-full sm:w-48">
                <label className="sr-only">Filter by role</label>
                <div className="relative">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>

                        {user.role === "superAdmin" && (
                          <SelectItem value="superAdmin">Super Admin</SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                </Select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            </div>
          </CardContent>
        </Card>



        {/* Users Table */}
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">User Accounts</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Login</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.length === 0 ? 
                    <div className="text-center text-gray-500 py-8">No User Found </div> : 
                    
                  filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hr-navy to-hr-navy-light flex items-center justify-center text-primary-foreground font-bold">
                            {user.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{u.userName}</p>
                            <p className="text-sm text-muted-foreground">{u.userEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className='p-4'>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(
                              u?.role
                            )}`}>{u.role}</span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                               'bg-success/10 text-success border-success/20'
                              // : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          Active
                        </span>
                      </td>

                      <td className="p-4 text-muted-foreground">
                        {u.lastLogin}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {(user.role === "superAdmin" ||
                            (user.role === "admin" &&
                              u.role !== "superAdmin")) && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleEditUser(u._id)}
                              // className="hover:bg-green-600/30"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                          )}
                          {user.role === "superAdmin" && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:bg-red-400/60"
                              onClick={() => setDeleteConfirmation(u._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>

                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {userForm.userId ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>

          {newUserList.length === 0 && !userForm.userId ? (
            <p className="text-red-500 text-center mt-4">
              No employees available to add.
            </p>
          ) : (
            <div className="space-y-4 mt-4">
              {/* USERNAME */}
              <div>
                <Label>Username</Label>

                {userForm.userId ? (
                  <Input
                    name="userName"
                    value={userForm.userName}
                    onChange={handleInputChange}
                    disabled={
                      !(
                        user.role === "superAdmin" ||
                        user.role === "admin"
                      )
                    }
                  />
                ) : (
                  <div className="relative"> 
                    <Select
                      value={userForm.userName}
                      onValueChange={(value) => {
                        const selected = newUserList.find(
                          (u) => u.name === value
                        );

                        setEmailHandler(selected);

                        handleInputChange({
                          target: {
                            name: "userName",
                            value,
                          },
                        });
                      }}
                    >
                      <SelectTrigger className="w-full h-10">
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>

                      <SelectContent>
                        {newUserList.map((user) => (
                          <SelectItem key={user.email} value={user.name}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                )}
              </div>

              {/* EMAIL */}
              <div>
                <Label>Email</Label>
                <Input
                  name="userEmail"
                  type="email"
                  value={userForm.userEmail}
                  onChange={handleInputChange}
                  disabled={!!userForm.userId}
                />
              </div>

              {/* PASSWORD – CREATE */}
              {!userForm.userId && (
                <div>
                  <Label>Password (Optional)</Label>
                  <Input
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleInputChange}
                    placeholder="Leave empty for default password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    If empty, default password will be:
                    <strong className="ml-1">
                      {userForm.userName
                        ?.toLowerCase()
                        .replace(/\s+/g, "")}@123
                    </strong>
                  </p>
                </div>
              )}

              {/* PASSWORD – EDIT */}
              {userForm.userId && (
                <>
                  <div>
                    <Label>New Password (Optional)</Label>
                    <Input
                      type="password"
                      name="password"
                      value={userForm.password}
                      onChange={handleInputChange}
                      placeholder="Leave empty to keep current password"
                    />
                  </div>

                  <div>
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      name="currentPassword"
                      value={userForm.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Required to change password"
                    />
                  </div>
                </>
              )}

              {/* ROLE */}
              <div>
                <Label>Role</Label>
                <div className="relative">
                  <Select
                    value={userForm.role}
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { name: "role", value },
                      })
                    }
                    disabled={userForm.userId && user.role !== "superAdmin"}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>

                      {user.role === "superAdmin" && (
                        <SelectItem value="superAdmin">Super Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <DialogFooter className="mt-6">
            <Button
              onClick={handleSubmit}
              disabled={!userForm.userId && newUserList.length === 0 && loading}
            >
              {loading ? <Loader2/> : ""}
              {userForm.userId ? (loading ? "Updating..." : "Update User") : (loading? "Adding..." : "Add User")}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setModalOpen(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Delete Dialog */}
      <Dialog
        open={!!deleteConfirmation}
        onOpenChange={() => setDeleteConfirmation(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmation(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteUser(deleteConfirmation)}
              disabled={loading}
            >
              {loading ? <Loader2/> : ""}
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
    </>
  );
};

export default AuthenticationManagement;
