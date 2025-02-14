import React from 'react';
import { Snackbar, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import '../css/LiarNotification.css';

const LiarNotification = ({ open, message, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box className="liar-notification">
        <div className="notification-content">
          <CheckCircleIcon className="success-icon" />
          <div className="message-container">
            <Typography variant="h6" className="notification-title">
              방 생성 완료!
            </Typography>
            <Typography variant="body2" className="notification-message">
              {message}
            </Typography>
          </div>
        </div>
        <div className="notification-progress"></div>
      </Box>
    </Snackbar>
  );
};

export default LiarNotification;
