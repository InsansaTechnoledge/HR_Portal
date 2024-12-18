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

function AppLayout() {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const {user,setUser} = useContext(userContext);
    const [loading, setLoading] = useState(true); // Add a loading state

    // Redirect to login if not logged in
    // if (!token && location.pathname !== '/') {
    //     return <Navigate to="/" replace />;
    // }

    // Show Sidebar for larger screens and BottomBar for smaller screens
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const showSidebar = user && !isMobile;


    const getUserData = async () => {
        try{

            axios.defaults.withCredentials = true;
            const response = await axios.get(`${API_BASE_URL}/api/auth/checkCookies`);
            
            if(response.status===201){
                setUser(response.data.user);
            }
            console.log(response.data);
        }
        catch(err){
            console.log(err);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(()=> {
        
        getUserData();
    },[])

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a proper loading spinner or component
    }

    return (
        <div className="flex h-screen">
            {showSidebar && <Sidebar />}
            {isMobile && user && <MobileBar />}
            <div className={`flex-1 p-4 overflow-auto ${showSidebar ? '' : 'w-full mb-14'}`}>
                <Routes>
                    <Route path="/" element={user ? <Home/> : <Login /> }/>
                    <Route
                        path="/post-job"
                        element={
                            <ProtectedRoute>
                                <JobPostForm />
                             </ProtectedRoute>
                        }
                    />
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
                    <Route
                        path="/add-employee"
                        element={
                            <ProtectedRoute>
                                <AddEmployeePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/talent"
                        element={
                            <ProtectedRoute>
                                <TalentManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/candidate-detail"
                        element={
                            <ProtectedRoute>
                                <CandidateDetails />
                             </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/application"
                        element={
                            <ProtectedRoute>
                                <JobApplication />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/auth"
                        element={
                            <ProtectedRoute>
                                <AuthenticationManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/register-candidate"
                        element={
                            <ProtectedRoute>
                                <CandidateRegistration />
                            </ProtectedRoute>
                        }
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
