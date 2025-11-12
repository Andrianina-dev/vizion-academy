import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
// import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import '../../../features/admin/styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const header = (
    <div className="flex justify-content-center mb-3">
      <i className="pi pi-shield" style={{ fontSize: '3rem', color: 'var(--primary-color)' }}></i>
    </div>
  );

  const footer = (
    <div className="flex flex-column align-items-center mt-3">
      <Divider />
      <span className="text-sm text-color-secondary mt-2">
        Pas encore de compte ?{' '}
        <a 
          href="/admin/register" 
          className="text-primary font-semibold no-underline hover:underline"
          onClick={(e) => {
            e.preventDefault();
            navigate('/admin/register');
          }}
        >
          Créer un compte administrateur
        </a>
      </span>
    </div>
  );

  return (
    <div className="login-container">
      <div className="flex align-items-center justify-content-center min-h-screen bg-gray-100">
        <Card 
          header={header}
          footer={footer}
          className="login-card shadow-4"
          title={
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-1">Connexion Administrateur</h2>
              <p className="text-color-secondary m-0">Accédez à votre espace d'administration</p>
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="p-fluid">
            {error && (
              <Message 
                severity="error" 
                text={error}
                className="mb-3 w-full"
              />
            )}

            <div className="field mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Adresse email *
              </label>
              <InputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full"
                disabled={loading}
                required
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe *
              </label>
              <Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full"
                feedback={false}
                toggleMask
                disabled={loading}
                required
              />
            </div>

            <Button
              type="submit"
              label="Se connecter"
              icon={loading ? "pi pi-spin pi-spinner" : "pi pi-sign-in"}
              className={classNames('w-full', { 'p-disabled': loading })}
              disabled={loading}
            />
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;