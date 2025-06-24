import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Meeting Code',
        text: 'Please enter a valid meeting code.',
      });
      return;
    }

    try {
      await addToUserHistory(meetingCode);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Joining UniChat Room: ${meetingCode}`,
        timer: 1200,
        showConfirmButton: false,
      });
      setTimeout(() => navigate(`/${meetingCode}`), 1200);
    } catch (err) {
      console.error('Failed to join meeting:', err);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Could not join the meeting. Try again.',
      });
    }
  };

  return (
    <>
      {/* ✅ NAVBAR */}
      <div className="navBar">
        <div className="navHeader">
          <h2 className="brand">UniChat</h2>
        </div>

        {/* Desktop nav */}
        <div className="navLinks">
          <Button
            className="navButton"
            startIcon={<RestoreIcon />}
            onClick={() => navigate('/history')}
          >
            History
          </Button>

          <Button
            className="navButton"
            startIcon={<LogoutIcon />}
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/auth');
            }}
          >
            Logout
          </Button>
        </div>

        {/* Hamburger */}
        <div className="hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          {mobileNavOpen ? <CloseIcon /> : <MenuIcon />}
        </div>

        {/* Mobile dropdown */}
        {mobileNavOpen && (
          <div className="mobileNavMenu">
            <Button
              fullWidth
              startIcon={<RestoreIcon />}
              onClick={() => {
                navigate('/history');
                setMobileNavOpen(false);
              }}
            >
              History
            </Button>

            <Button
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/auth');
              }}
            >
              Logout
            </Button>
          </div>
        )}
      </div>

      {/* ✅ MAIN CONTENT */}
      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2 style={{ color: '#0F172A', marginBottom: '2rem' }}>
              Connect with clarity.<br /> Communicate with confidence.
            </h2>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' , justifyContent: "center" }}> 
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                label="Enter Meeting Code"
                variant="outlined"
                fullWidth
              />
              <Button
                onClick={handleJoinVideoCall}
                variant="contained"
                style={{ height: '56px',width:"100px", fontSize:"1.25rem" }}
              >
                Join
              </Button>
            </div>
          </div>
        </div>

        <div className="rightPanel">
          <img srcSet="/logo3.png" alt="UniChat Visual" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
