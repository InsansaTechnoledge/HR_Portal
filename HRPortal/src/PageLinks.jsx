import React from 'react'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Login from './Components/Login/Login';
import Home from './Page/Home';

function PageLinks() {
  return (
    <>
        <Router>
            <Routes>
                <Route path='/' element={<Login/>} />
                <Route path='/home' element={<Home />} />
            </Routes>
        </Router>
        
    </>

    )
}

export default PageLinks;