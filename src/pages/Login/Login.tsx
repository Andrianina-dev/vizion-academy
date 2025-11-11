// components/Login.tsx
import React, { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message } from 'primereact/message';
import AuthLayout from '../../components/layout/AuthLayout';
import CustomInput from '../../components/ui/forms/customInput/CustomInput';
import CustomButton from '../../components/ui/forms/customButton/CustomButton';
import { loginEcole } from '../../services/ecoleService';

interface LoginFormData {
  email: string; // ← Changé de id_ecole à email
  mot_de_passe: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({ email: '', mot_de_passe: '' });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (loginError) setLoginError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    // Validation email
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    // Validation mot de passe
    if (!formData.mot_de_passe) {
      newErrors.mot_de_passe = 'Le mot de passe est requis';
    } else if (formData.mot_de_passe.length < 6) {
      newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setLoginError('');

    try {
      const data = await loginEcole({
        email: formData.email, // ← Envoyer email au lieu de id_ecole
        mot_de_passe: formData.mot_de_passe,
      });

      if (data.success) {
        // ✅ Afficher l'ID de l'école dans la console
        console.log('✅ Connexion réussie!');
        console.log('ID École connectée :', data.ecole?.id_ecole);
        console.log('Nom École :', data.ecole?.nom_ecole);
        console.log('Email École :', data.ecole?.email);

        // ✅ Rediriger vers le dashboard
        navigate('/dashboard');
      } else {
        setLoginError(data.message || 'Identifiants incorrects');
      }
    } catch (error: any) {
      setLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <AuthLayout title="Connexion" subtitle="Accédez à votre compte école">
      <div onKeyPress={handleKeyPress} className="space-y-3">
        {loginError && <Message severity="error" text={loginError} className="w-full mb-3" />}

        <CustomInput
          label="Email de l'école" // ← Changé le label
          value={formData.email}
          onChange={handleInputChange('email')}
          type="email" // ← Type email
          placeholder="Ex: ecole@example.com"
          error={errors.email}
          icon="pi pi-envelope" // ← Icône email
        />

        <CustomInput
          label="Mot de passe"
          value={formData.mot_de_passe}
          onChange={handleInputChange('mot_de_passe')}
          type="password"
          placeholder="Votre mot de passe"
          error={errors.mot_de_passe}
          icon="pi pi-lock"
        />

        <CustomButton
          label="Se connecter"
          onClick={handleLogin}
          loading={loading}
          disabled={loading}
          severity="secondary"
          size="large"
        />
      </div>
    </AuthLayout>
  );
};

export default Login;