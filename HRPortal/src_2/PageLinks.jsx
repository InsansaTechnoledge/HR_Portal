import React, { useState, useContext, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import ProtectedRoute from './Route/ProtectedRoute';
import Login from './Components/Login/Login';
import JobPostForm from './Components/Form/JobPostForm';
import Home from './Page/Home';
import CandidateRegistration from './Page/CandidateRegistration';
import DocumentManagement from './Page/DocumentManagement';
import Sidebar from './Components/Login/Sidebar';
import MobileBar from './Components/Login/MobileBar';
import TalentManagement from './Page/TalentManagement';
import JobApplication from './Page/JobApplication';
import AuthenticationManagement from './Page/AuthenticationManagement';
import LeaveTracker from './Page/LeaveTracker';
import CandidateDetails from './Components/CandidateRegistrationForm/CandidateDetail';
import { userContext } from './Context/userContext';
import axios from 'axios';
import API_BASE_URL from './config';
import AddEmployeePage from './Page/AddEmployee';
import SuperAdminRoute from './Route/SuperAdminRoute';
import AdminRoute from './Route/AdminRoute';

function AppLayout() {
    // const location = useLocation();
    // const token = localStorage.getItem('token');
    const { user, setUser } = useContext(userContext);
    const [loading, setLoading] = useState(true);

    // Determine if the user is on a mobile device
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const showSidebar = user && !isMobile;

    const getUserData = async () => {
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.get(`${API_BASE_URL}/api/auth/checkCookies`);
            if (response.status === 201) {
                setUser(response.data.user);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a proper loading spinner or component
    }

    return (
        <div className="flex h-screen">
            {showSidebar && <Sidebar />}
            {isMobile && user && <MobileBar />}
            <div className={`flex-1 p-4 overflow-auto ${showSidebar ? '' : 'w-full mb-14'}`}>
                <Routes>
                    {/* Common Routes */}
                    <Route path="/" element={user ? <Home /> : <Login />} />
                    <Route
                        path="/docs"
                        element={
                            <ProtectedRoute>
                                <DocumentManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/leave-tracker"
                        element={
                            <ProtectedRoute>
                                <LeaveTracker />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin-Only Routes */}

                    <Route
                        path="/post-job"
                        element={
                            <AdminRoute>
                                <JobPostForm />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/add-employee"
                        element={
                            <AdminRoute>
                                <AddEmployeePage />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/talent"
                        element={
                            <AdminRoute>
                                <TalentManagement />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/candidate-detail"
                        element={
                            <AdminRoute>
                                <CandidateDetails />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/application"
                        element={
                            <AdminRoute>
                                <JobApplication />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/register-candidate"
                        element={
                            <AdminRoute>
                                <CandidateRegistration />
                            </AdminRoute>
                        }
                    />


                    {/* Super Admin route */}
                    <Route
                        path="/auth"
                        element={
                            <SuperAdminRoute>
                                <AuthenticationManagement />
                            </SuperAdminRoute>
                        }
                    />

                    <Route 
                        path='*'
                        element={<Navigate to='/' replace />} 
                    />
                </Routes>
            </div>
        </div>
    );
}

function PageLinks() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default PageLinks;