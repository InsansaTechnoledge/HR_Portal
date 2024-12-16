import React from 'react'
import {BrowserRouter as Router,Routes,Route, Form} from 'react-router-dom'
import Login from './Components/Login/Login'
import JobPostForm from './Components/Form/JobPostForm';
import Home from './Page/Home';
import CandidateRegistration from './Page/CandidateRegistration';
import DocumentManagement from "./Page/DocumentManagement";
import Sidebar from "./Components/Login/Sidebar";
import TalentManagement from "./Page/TalentManagement";
import JobApplication from "./Page/JobApplication";
import AuthenticationManagement from "./Page/AuthenticationManagement";

function AppLayout() {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />
            <div className="flex-1 p-4 overflow-auto">
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/post-job" element={<JobPostForm />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/docs" element={<DocumentManagement />} />
                    <Route path="/talent" element={<TalentManagement />} />
                    <Route path="/application" element={<JobApplication />} />
                    <Route path="/auth" element={<AuthenticationManagement />} />
                    <Route path='/register-candidate' element={<CandidateRegistration/>}/>
                    
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
