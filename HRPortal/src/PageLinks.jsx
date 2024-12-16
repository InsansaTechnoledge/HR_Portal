import React from 'react';
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
// import BottomBar from './Components/Navigation/BottomBar';
import MobileBar from './Components/Login/MobileBar';
import TalentManagement from './Page/TalentManagement';
import JobApplication from './Page/JobApplication';
import AuthenticationManagement from './Page/AuthenticationManagement';
import LeaveTracker from './Page/LeaveTracker';

function AppLayout() {
    const location = useLocation();
    const token = localStorage.getItem('token');

    // Redirect to login if not logged in
    // if (!token && location.pathname !== '/') {
    //     return <Navigate to="/" replace />;
    // }

    // Show Sidebar for larger screens and BottomBar for smaller screens
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
    const showSidebar = location.pathname !== '/' && !isMobile;

    return (
        <div className="flex h-screen">
            {showSidebar && <Sidebar />}
            {isMobile && location.pathname !== '/' && <MobileBar />}
            <div className={`flex-1 p-4 overflow-auto ${showSidebar ? '' : 'w-full'}`}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route
                        path="/post-job"
                        element={
                            <ProtectedRoute>
                                <JobPostForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
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
                        path="/talent"
                        element={
                            <ProtectedRoute>
                                <TalentManagement />
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
                            // <ProtectedRoute>
                                <CandidateRegistration />
                            // </ProtectedRoute>
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
