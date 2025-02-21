import React from 'react'
import Navbar from './Components/Navbar'
import Login from './Pages/Login'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Signup from "./Pages/Signup";
import Chatbot from "./Pages/Chatbot";
import Footer from './Components/Footer'
import SignOut from './Pages/Signout';
import Profile from './Pages/Profile';

function App() {
  return (
    <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Chatbot/>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/signout" element={<SignOut/>} />
      <Route path="/profile" element={<Profile/>} />
    </Routes>
    <Footer/>
  </Router>
  )
}

export default App