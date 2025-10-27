import React from 'react';
import type { ReactNode } from 'react';
import { Card } from 'primereact/card';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex align-items-center justify-content-center p-3 relative overflow-hidden">
      {/* Background avec gradient élégant */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      ></div>
      
      {/* Formes décoratives */}
      <div className="absolute top-10% left-10% w-20rem h-20rem bg-white bg-opacity-5 rounded-full blur-xl"></div>
      <div className="absolute bottom-10% right-10% w-25rem h-25rem bg-white bg-opacity-5 rounded-full blur-xl"></div>

      <div className="grid grid-nogutter w-full max-w-5xl relative z-1">
        
        {/* Section formulaire */}
        <div className="col-12 lg:col-5 flex justify-content-center p-3">
          <Card 
            className="shadow-5 border-round-2xl w-full max-w-450 border-none"
            style={{
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
            pt={{
              root: { 
                className: 'border-none backdrop-blur-sm' 
              },
              body: { className: 'py-6 px-5' },
              content: { className: 'p-0' }
            }}
          >
            {/* En-tête */}
            <div className="text-center mb-6">
              <div className="flex justify-content-center mb-4">
                <div 
                  className="w-4rem h-4rem border-circle flex align-items-center justify-content-center shadow-3"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <i className="pi pi-graduation-cap text-white text-2xl"></i>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-900 mb-3">{title}</h1>
              {subtitle && (
                <p className="text-600 text-lg mb-0 line-height-3">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Formulaire - Correction des largeurs d'inputs */}
            <div className="flex flex-column gap-4 w-full">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  // Appliquer une classe CSS pour uniformiser la largeur
                  return React.cloneElement(child, {
                    // @ts-ignore
                    ...child.props,
                    // className: `w-full ${child.props.className || ''}`
                  });
                }
                return child;
              })}
            </div>

            {/* Footer de la carte */}
            <div className="text-center mt-5 pt-3 border-top-1 surface-300">
              <p className="text-sm text-600 mb-0">
                © 2025 ECOLE. Tous droits réservés.
              </p>
            </div>
          </Card>
        </div>

        {/* Section information */}
        <div className="col-12 lg:col-7 flex align-items-center justify-content-center p-5">
          <div className="text-center lg:text-left max-w-500">
            {/* Logo */}
            <div className="flex align-items-center justify-content-center lg:justify-content-start mb-6">
              <div 
                className="w-3rem h-3rem border-round-lg flex align-items-center justify-content-center shadow-3 mr-3"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <i className="pi pi-graduation-cap text-white text-xl"></i>
              </div>
              <span className="text-4xl font-bold text-white">ECOLE</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Votre succès
              <span 
                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200"
              >
                académique
              </span>
              commence ici
            </h1>
            
            <p className="text-xl text-white text-opacity-90 mb-6 line-height-3">
              Rejoignez notre plateforme éducative d'excellence et accédez à des 
              ressources pédagogiques innovantes pour transformer votre apprentissage.
            </p>

            {/* Points forts */}
            <div className="grid text-white text-opacity-90 mb-6">
              <div className="col-12 md:col-6 flex align-items-center mb-4">
                <i className="pi pi-check-circle text-white text-xl mr-3"></i>
                <span className="text-lg">Cours interactifs et modernes</span>
              </div>
              <div className="col-12 md:col-6 flex align-items-center mb-4">
                <i className="pi pi-check-circle text-white text-xl mr-3"></i>
                <span className="text-lg">Suivi personnalisé</span>
              </div>
              <div className="col-12 md:col-6 flex align-items-center mb-4">
                <i className="pi pi-check-circle text-white text-xl mr-3"></i>
                <span className="text-lg">Ressources illimitées</span>
              </div>
              <div className="col-12 md:col-6 flex align-items-center mb-4">
                <i className="pi pi-check-circle text-white text-xl mr-3"></i>
                <span className="text-lg">Support 24h/24</span>
              </div>
            </div>

            {/* Statistiques */}
            <div className="flex flex-wrap gap-5 justify-content-center lg:justify-content-start">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-white text-opacity-80">Étudiants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-white text-opacity-80">Réussite</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-white text-opacity-80">Disponible</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;