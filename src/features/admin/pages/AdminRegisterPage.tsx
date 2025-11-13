import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Box, Typography, Paper, Alert, Link } from '@mui/material';
import adminService from '../adminService';

const AdminRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (formData.password !== formData.password_confirmation) {
        throw new Error('Les mots de passe ne correspondent pas');
      }

      await adminService.registerAdmin({
        nom_admin: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        is_admin: true
      });
      
      setSuccess('Compte administrateur créé avec succès ! Redirection vers la page de connexion...');
      
      // Redirection vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate('/admin/login'); // Assurez-vous que cette route est correcte
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de l\'inscription:', err);
      const error = err as Error;
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" sx={{ mb: 3 }}>
            Créer un compte Administrateur
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name_admin"
              label="Nom complet"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password_confirmation"
              label="Confirmer le mot de passe"
              type="password"
              id="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Création en cours...' : 'Créer le compte'}
            </Button>
            <Box textAlign="center">
              <Link 
                component="button" 
                variant="body2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin');
                }}
                sx={{ cursor: 'pointer' }}
              >
                Déjà un compte ? Connectez-vous
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminRegisterPage;
