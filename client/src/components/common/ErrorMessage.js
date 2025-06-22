import React, { useContext } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { ErrorContext } from '../../context/ErrorContext';

const ErrorMessage = () => {
  const { error } = useContext(ErrorContext);

  return (
    <Snackbar open={!!error} autoHideDuration={5000}>
      <Alert severity="error" elevation={6} variant="filled">
        {error}
      </Alert>
    </Snackbar>
  );
};

export default ErrorMessage;