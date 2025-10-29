// components/layout/AuthLayout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import { Card } from 'primereact/card';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  variant?: 'split' | 'centered';
  showInfoPanel?: boolean;
  footerText?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  variant = 'split', 
  showInfoPanel = true, 
  footerText = '© 2025 Vizion Academy - Excellence Éducative' 
}) => {
  return (
    <div className="min-h-screen flex align-items-center justify-content-center p-3 relative overflow-hidden">
      {/* Background Premium */}
      <div 
        className="absolute inset-0"
        style={{
          background: variant === 'centered'
            ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        }}
      ></div>
      
      {/* Effets de lumière */}
      {variant !== 'centered' && (
        <>
          <div 
            className="absolute top-10% left-5% w-30rem h-30rem rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #475569 0%, transparent 70%)'
            }}
          ></div>
          <div 
            className="absolute bottom-15% right-10% w-25rem h-25rem rounded-full opacity-15 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #64748b 0%, transparent 70%)'
            }}
          ></div>
        </>
      )}

      <div className={`grid grid-nogutter w-full ${variant === 'centered' ? 'max-w-30rem' : 'max-w-6xl'} relative z-1`}>
        
        {/* Section formulaire */}
        <div className={`col-12 ${variant === 'centered' ? '' : 'lg:col-5'} flex justify-content-center p-3`}>
          <Card 
            className={`w-full border-round-3xl ${variant === 'centered' ? 'shadow-4' : 'shadow-6'} border-none`}
            style={{
              backdropFilter: variant === 'centered' ? 'blur(10px)' : 'blur(20px)',
              backgroundColor: variant === 'centered' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.08)',
              border: variant === 'centered' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
            pt={{
              root: { 
                className: 'border-none backdrop-blur-lg' 
              },
              body: { className: `${variant === 'centered' ? 'py-6 px-5' : 'py-8 px-6'}` },
              content: { className: 'p-0' }
            }}
          >
            {/* En-tête Premium */}
            <div className="text-center mb-6">
              <div className="flex justify-content-center mb-5">
                <div 
                  className="w-5rem h-5rem border-round-2xl flex align-items-center justify-content-center shadow-4"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <i className="pi pi-graduation-cap text-white text-3xl"></i>
                </div>
              </div>
              <h1 
                className={`${variant === 'centered' ? 'text-3xl' : 'text-4xl'} font-bold mb-3`}
                style={{
                  color: variant === 'centered' ? '#1e293b' : '#ffffff',
                  textShadow: variant === 'centered' ? 'none' : '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p 
                  className={`${variant === 'centered' ? 'text-lg' : 'text-xl'} mb-0 line-height-3 font-light`}
                  style={{
                    color: variant === 'centered' ? '#64748b' : 'rgba(255, 255, 255, 0.8)'
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Contenu du formulaire */}
            <div className="flex flex-column gap-4 w-full">
              {children}
            </div>

            {/* Footer Premium */}
            <div 
              className="text-center mt-6 pt-4 border-top-1"
              style={{
                borderColor: variant === 'centered' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)'
              }}
            >
              <p 
                className="text-sm mb-0 font-light"
                style={{
                  color: variant === 'centered' ? '#64748b' : 'rgba(255, 255, 255, 0.6)'
                }}
              >
                {footerText}
              </p>
            </div>
          </Card>
        </div>

        {/* Section information Premium */}
        {variant !== 'centered' && showInfoPanel && (
          <div className="col-12 lg:col-7 flex align-items-center justify-content-center p-6">
            <div className="text-center lg:text-left max-w-2xl">
              {/* Logo Premium */}
              <div className="flex align-items-center justify-content-center lg:justify-content-start mb-8">
                <div 
                  className="w-4rem h-4rem border-round-xl flex align-items-center justify-content-center shadow-4 mr-4"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <i className="pi pi-graduation-cap text-white text-2xl"></i>
                </div>
                <div>
                  <h1 
                    className="text-5xl font-bold text-white mb-1 tracking-tight"
                    style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                  >
                    VIZION
                  </h1>
                  <p 
                    className="text-xl text-amber-200 font-light tracking-widest mb-0"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                  >
                    ACADEMY
                  </p>
                </div>
              </div>

              {/* Message Principal */}
              <h2 
                className="text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
              >
                L'Excellence
                <span 
                  className="block bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent"
                >
                  Pédagogique
                </span>
                Réinventée
              </h2>
              
              <p 
                className="text-2xl text-white text-opacity-90 mb-8 line-height-4 font-light"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
              >
                Rejoignez le cercle restreint des experts qui façonnent l'avenir de l'éducation 
                grâce à des méthodologies innovantes et un accompagnement d'exception.
              </p>

              {/* Points Forts Élégants */}
              <div className="grid mb-8">
                {[
                  { icon: 'pi-star', text: 'Prestige académique reconnu' },
                  { icon: 'pi-chart-line', text: 'Impact pédagogique mesurable' },
                  { icon: 'pi-shield', text: 'Environnement sécurisé' },
                  { icon: 'pi-rocket', text: 'Innovation continue' }
                ].map((item, index) => (
                  <div key={index} className="col-12 md:col-6 flex align-items-center mb-5">
                    <div 
                      className="w-3rem h-3rem border-round-lg flex align-items-center justify-content-center mr-4 shadow-3"
                      style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <i className={`pi ${item.icon} text-amber-400 text-xl`}></i>
                    </div>
                    <span 
                      className="text-lg text-white font-medium"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Statistiques Prestigieuses */}
              <div className="flex flex-wrap gap-6 justify-content-center lg:justify-content-start">
                {[
                  { value: '500+', label: 'Experts' },
                  { value: '99%', label: 'Satisfaction' },
                  { value: '5★', label: 'Qualité' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div 
                      className="text-4xl font-bold text-amber-300 mb-1"
                      style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-amber-100 text-opacity-80 text-sm font-light tracking-widest"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthLayout;