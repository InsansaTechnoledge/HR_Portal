import React from 'react'
import {BrowserRouter as Router,Routes,Route, Form} from 'react-router-dom'
import Login from './Components/Login/Login'
import JobPostForm from './Components/Form/JobPostForm';
import Home from './Page/Home';
import CandidateRegistration from './Page/CandidateRegistration';

function PageLinks() {
  return (
    <>
        <Router>
            <Routes>
                <Route path='/' element={<Login/>} />
                <Route path='/post-job' element={<JobPostForm/>} />
                <Route path='/home' element={<Home />} />
                <Route path='/home' element={<Home />} />
                <Route path='/register-candidate' element={<CandidateRegistration/>}/>
            </Routes>
        </Router>
        
    </>

    )
}

export default PageLinks;