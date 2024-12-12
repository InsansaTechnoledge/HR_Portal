import React from 'react'
import {BrowserRouter as Router,Routes,Route, Form} from 'react-router-dom'
import Login from './Components/Login/Login'
import JobPostForm from './Components/Form/JobPostForm';

function PageLinks() {
  return (
    <>
        <Router>
            <Routes>
                <Route path='/' element={<Login/>} />
                <Route path='/post-job' element={<JobPostForm/>} />
            </Routes>
        </Router>
        
    </>

    )
}

export default PageLinks;