import React from 'react'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import Login from './Components/Login/Login'

function PageLinks() {
  return (
    <>
        <Router>
            <Routes>
                <Route path='/' element={<Login/>} />
            </Routes>
        </Router>
        
    </>

    )
}

export default PageLinks;