import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../App.css";
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function LandingPage() {
  const router = useNavigate();
    
const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className='landingPageContainer'>
      {/* Navbar */}
      <nav className="responsiveNavbar">
  <div className="navHeader">
    <h2>UniChat</h2>
  </div>

<div className="desktopNav">
  <button className="navBtn" onClick={() => router("/aljk23")}>Join as Guest</button>
  <button className="navBtn" onClick={() => router("/auth")}>Register</button>
  <button className="navBtn" onClick={() => router("/auth")}>Login</button>
</div>

<div className="hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
  {mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
</div>

{mobileNavOpen && (
  <div className="mobileNavMenu">
    <button className="navBtn" onClick={() => router("/aljk23")}>Join as Guest</button>
    <button className="navBtn" onClick={() => router("/auth")}>Register</button>
    <button className="navBtn" onClick={() => router("/auth")}>Login</button>
  </div>
)}

</nav>


      {/* Main Section */}
      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#FF9839" }}>Seamless</span> Video Meetings, <br />
            <span style={{ color: "#FF9839" }}>Limitless</span> Possibilities
          </h1>
          <p style={{ fontSize: "1.1rem", marginTop: "1rem", maxWidth: "500px" }}>
            Experience premium-quality calls, reconnect instantly, and collaborate from anywhere. With UniChat, distance is just a number.
          </p>
          <div role='button' className="ctaButton">
            <Link to="/auth">Get Started</Link>
          </div>
        </div>

        <div>
          <img src="/mobile.png" alt="Video call preview" />
        </div>
      </div>
    </div>
  );
}
