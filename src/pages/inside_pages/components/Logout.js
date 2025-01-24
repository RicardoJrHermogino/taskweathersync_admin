'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const LogoutDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperComponent={Paper}
      PaperProps={{
        elevation: 2,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: 'warning.main'
      }}>
        <WarningIcon color="inherit" />
        Confirm Logout
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to log out? You will need to sign in again to access your account.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            minWidth: 100,
            borderRadius: 1
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm}
          variant="contained"
          color="primary"
          sx={{ 
            minWidth: 100,
            borderRadius: 1
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutDialog;