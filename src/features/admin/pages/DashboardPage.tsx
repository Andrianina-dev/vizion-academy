import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Container, Typography, Button, Box } from '@mui/material';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography component="h1" variant="h4" gutterBottom>
          Tableau de bord Administrateur
        </Typography>
        {user && (
          <Box sx={{ mt: 2 }}>
            <Typography>Connecté en tant que: {user.email}</Typography>
            <Typography>Rôle: {user.role}</Typography>
          </Box>
        )}
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
            sx={{ mt: 2 }}
          >
            Se déconnecter
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default DashboardPage;
