import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Paper, Snackbar, Alert, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { createArtwork } from '../../services/api';

const ArtworkUpload = () => {
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startingPrice: '',
    image: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('startingPrice', formData.startingPrice);
      formDataToSend.append('image', formData.image);

      await createArtwork(formDataToSend);
      setOpenSnackbar(true);
      
      setTimeout(() => {
        navigate('/artworks');
      }, 2000);
    } catch (error) {
      console.error('Error creating artwork:', error);
      alert(error.response?.data?.message || 'Failed to create artwork');
    }
  };

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({
        ...formData,
        image: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: 20, marginTop: 20 }}>
        <Typography variant="h5" gutterBottom>
          Upload New Artwork
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="title"
            label="Artwork Title"
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            multiline
            rows={4}
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="startingPrice"
            label="Starting Price"
            type="number"
            value={formData.startingPrice}
            onChange={handleChange}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            type="file"
            onChange={handleChange}
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              style={{ marginTop: 20 }}
            >
              Upload Image
            </Button>
          </label>
          {formData.image && (
            <Typography variant="body2" style={{ marginTop: 10 }}>
              Selected file: {formData.image.name}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ marginTop: 20 }}
          >
            Upload Artwork
          </Button>
        </form>
      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" elevation={6} variant="filled">
          Artwork uploaded successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ArtworkUpload;