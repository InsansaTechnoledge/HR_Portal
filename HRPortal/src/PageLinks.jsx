import React from 'react'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Login from './Components/Login/Login';
import Home from './Page/Home';
// import JobForm from './Components/Form/Form1';
// import JobPostForm from './Components/Form/JobPostForm';

function PageLinks() {
  return (
    <>
        <Router>
            <Routes>
                <Route path='/' element={<Login/>} />
                <Route path='/home' element={<Home />} />
                {/* <Route path='/form' element={<JobForm/>} /> */}
                {/* <Route path='/post-job' element={<JobPostForm/>} /> */}
            </Routes>
        </Router>
        
    </>

    )
}

export default PageLinks;