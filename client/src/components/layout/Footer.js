import React from 'react';
import { Container, Grid, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#f5f5f5', padding: '40px 0', marginTop: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              About Us
            </Typography>
            <Typography variant="body2" color="textSecondary">
              eBidz is a premier platform for buying and selling unique artworks.
              We connect artists with art enthusiasts worldwide.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Typography variant="body2">
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                Home
              </Link>
            </Typography>
            <Typography variant="body2">
              <Link to="/artworks" style={{ color: 'inherit', textDecoration: 'none' }}>
                Artworks
              </Link>
            </Typography>
            <Typography variant="body2">
              <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>
                About
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email: support@artauction.com
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Phone: (123) 456-7890
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: 20 }}>
          © {new Date().getFullYear()} eBidz. All rights reserved.
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;