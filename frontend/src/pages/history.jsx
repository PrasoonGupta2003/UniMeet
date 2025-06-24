import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';

export default function History() {
  const { getHistoryOfUser, clearUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();

  const fetchHistory = async () => {
    try {
      const history = await getHistoryOfUser();
      if (Array.isArray(history)) {
        setMeetings(history);
        if (history.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'No History Found',
            text: 'You have not joined any meetings yet.',
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } else {
        console.error('❌ History is not an array', history);
      }
    } catch (err) {
      console.error('❌ Failed to fetch history', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load history. Try again later.',
      });
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete all your meeting history permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear it!',
    });

    if (result.isConfirmed) {
      try {
        await clearUserHistory();
        setMeetings([]);
        Swal.fire({
          title: 'Deleted!',
          text: 'Your meeting history has been cleared.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error('❌ Failed to clear history', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not clear history. Try again later.',
        });
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={{ padding: '1rem' }}>
      <IconButton onClick={() => routeTo('/home')}>
        <HomeIcon />
      </IconButton>

      {meetings.length > 0 && (
        <Button
          variant="contained"
          color="error"
          onClick={handleClearHistory}
          sx={{ mb: 2 }}
        >
          Clear History
        </Button>
      )}

      {Array.isArray(meetings) && meetings.length > 0 ? (
        meetings.map((e, i) => (
          <Card key={i} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Code: {e.meetingCode}
              </Typography>
              <Typography sx={{ mb: 1.5 }} color="text.secondary">
                Date: {formatDate(e.date)}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body1">No history found</Typography>
      )}
    </div>
  );
}
