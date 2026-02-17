import { useState } from "react";
import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Landingpage from "./Pages/Landing.jsx";
import Authentication from "./Pages/Authentication.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import VideoMeetComponent from "./Pages/VideoMeet.jsx";
// import PageNotfound from './Pages/PageNotfound.jsx'
function App() {
  return (
    <>
      {/* <PageNotfound/> */}
      <Router>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Landingpage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path='/:url' element={<VideoMeetComponent/>}/>
        </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
