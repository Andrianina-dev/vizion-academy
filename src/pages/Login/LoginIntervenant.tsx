// components/LoginIntervenant.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Message } from 'primereact/message';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import AuthLayout from '../../components/layout/AuthLayout';
import CustomInput from '../../components/ui/forms/customInput/CustomInput';
import CustomButton from '../../components/ui/forms/customButton/CustomButton';
import { loginIntervenant } from '../../services/intervenantService';

interface LoginFormData {
  email: string;
  mot_de_passe: string;
}

const LoginIntervenant: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({ email: '', mot_de_passe: '' });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (loginError) setLoginError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email n'est pas valide";

    if (!formData.mot_de_passe) newErrors.mot_de_passe = 'Le mot de passe est requis';
    else if (formData.mot_de_passe.length < 6) newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setLoginError('');

    try {
      const data = await loginIntervenant({
        email: formData.email,
        mot_de_passe: formData.mot_de_passe,
      });

      if (data.success) {
        navigate('/dashboard-intervenant');
      } else {
        setLoginError(data.message || 'Identifiants incorrects');
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          const body: any = error.response?.data || {};
          if (body?.error === 'rejected') {
            setLoginError("Votre profil a été rejeté par l'administrateur");
          } else {
            setLoginError('Votre profil est en attente de validation');
          }
        } else {
          const apiMsg = (error.response?.data as any)?.message;
          setLoginError(apiMsg || 'Email ou mot de passe incorrect');
        }
      } else {
        setLoginError('Erreur lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleLogin();
  };

  return (
    <AuthLayout
      title="Portail Expert"
      subtitle="Accès réservé aux intervenants pédagogiques"
      variant="split"
      showInfoPanel={true}
      footerText="© 2025 Vizion Academy - Excellence Éducative"
    >
      <form onSubmit={handleSubmit} className="flex flex-column gap-4 w-full">
        {loginError && (
          <Message
            severity="error"
            text={loginError}
            className="w-full border-round-2xl border-red-200 bg-red-50"
          />
        )}

        <div className="mb-3">
          <label className="block text-900 font-medium mb-3 text-sm">
            Identifiant Professionnel
          </label>
          <CustomInput
            value={formData.email}
            onChange={handleInputChange('email')}
            type="email"
            placeholder="expert@vizion-academy.com"
            error={errors.email}
            icon="pi pi-user"
            size="large"
            className="w-full border-1 surface-300 focus:border-primary transition-colors transition-duration-300"
          />
        </div>

        <div className="mb-1">
          <label className="block text-900 font-medium mb-3 text-sm">
            Code d'Accès
          </label>
          <CustomInput
            value={formData.mot_de_passe}
            onChange={handleInputChange('mot_de_passe')}
            type="password"
            placeholder="••••••••"
            error={errors.mot_de_passe}
            icon="pi pi-key"
            size="large"
            className="w-full border-1 surface-300 focus:border-primary transition-colors transition-duration-300"
          />
        </div>

        <div className="flex align-items-center justify-content-between mb-4">
          <div className="flex align-items-center">
            <Checkbox
              inputId="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(!!e.checked)}
              className="mr-2"
            />
            <label
              htmlFor="remember"
              className="text-600 text-sm cursor-pointer select-none"
            >
              Maintenir la session
            </label>
          </div>

          <Button
            type="button"
            link
            label="Accès perdu ?"
            onClick={() => navigate('/forgot-password')}
            className="p-0 text-primary text-sm font-medium"
          />
        </div>

        <CustomButton
          label="Accéder à l'Espace Expert"
          onClick={handleLogin}
          loading={loading}
          disabled={loading}
          size="large"
          icon="pi pi-arrow-right"
          className="w-full bg-gradient-to-r from-primary to-primary-600 border-0 text-white py-3 text-base font-semibold shadow-2 hover:shadow-4 transition-all transition-duration-300"
          type="submit"
          iconPos="right"
        />

        <Divider className="my-4">
          <span className="text-600 text-sm px-3 bg-white">Nouvel Expert</span>
        </Divider>

        <div className="text-center">
          <Button
            type="button"
            label="Rejoindre notre Réseau d'Experts"
            onClick={() => navigate('/register-intervenant')}
            className="p-0 text-primary text-sm font-semibold border-bottom-1 border-primary border-300 hover:border-primary-500 transition-colors rounded-none"
            text
          />
        </div>

        <div className="text-center mt-3">
          <Button
            type="button"
            icon="pi pi-arrow-left"
            label="Retour au site principal"
            onClick={() => navigate('/')}
            className="p-button-text text-600 hover:text-900 text-sm"
          />
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginIntervenant;