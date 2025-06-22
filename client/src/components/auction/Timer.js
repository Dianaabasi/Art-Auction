import React, { useState, useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const TimerContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#f5f5f5',
}));

const Timer = ({ endTime, onTimeEnd }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });
  const [progress, setProgress] = useState(100);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endTime);
      const difference = end - now;
      
      if (difference <= 0) {
        setIsEnded(true);
        if (onTimeEnd) onTimeEnd();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0,
        };
      }
      
      // Calculate total auction duration (assuming it started 7 days before end)
      const totalDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      const progressPercent = (difference / totalDuration) * 100;
      setProgress(Math.min(progressPercent, 100));
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        total: difference,
      };
    };

    // Don't start the timer if already ended
    if (new Date(endTime) <= new Date()) {
      setIsEnded(true);
      if (onTimeEnd) onTimeEnd();
      return;
    }

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);
      
      if (updatedTimeLeft.total <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onTimeEnd]);

  const formatTime = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  if (isEnded) {
    return (
      <TimerContainer>
        <Typography variant="h6" color="error" align="center">
          Auction Ended
        </Typography>
      </TimerContainer>
    );
  }

  return (
    <TimerContainer>
      <Typography variant="subtitle1" gutterBottom>
        Auction Ends In:
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h4">{timeLeft.days}</Typography>
          <Typography variant="caption">Days</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h4">{formatTime(timeLeft.hours)}</Typography>
          <Typography variant="caption">Hours</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h4">{formatTime(timeLeft.minutes)}</Typography>
          <Typography variant="caption">Minutes</Typography>
        </Box>
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h4">{formatTime(timeLeft.seconds)}</Typography>
          <Typography variant="caption">Seconds</Typography>
        </Box>
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ 
          height: 8, 
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            backgroundColor: progress < 20 ? 'error.main' : 'primary.main'
          }
        }} 
      />
    </TimerContainer>
  );
};

export default Timer;