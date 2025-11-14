import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import SupportTickets from '@/components/Support/SupportTickets';
import { createSupportTicket } from '@/features/support/supportService';
import DashboardLayout from '@/components/layout/DashboardLayout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { getIdEcoleConnectee } from '@/services/ecoleService';

const SupportPage: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeSection] = useState('support');
  const navigate = useNavigate();
  const ecoleId = getIdEcoleConnectee() || '';

  const handleSectionSelect = (section: string) => {
    if (section !== 'support') {
      navigate(`/dashboard?section=${section}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createSupportTicket({
        subject,
        message,
        status: 'ouvert' // Le statut par défaut
      });

      // Réinitialiser le formulaire
      setSubject('');
      setMessage('');
      setIsSuccess(true);

      // Recharger la liste des tickets
      // Vous pourriez vouloir ajouter un état pour la liste des tickets ici

      // Cacher le message de succès après 5 secondes
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError('Une erreur est survenue lors de l\'envoi de votre message');
      console.error('Error submitting support ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      onSelect={handleSectionSelect}
      activeSection={activeSection}
      userId={ecoleId}
      userType="ecole"
    >
      <div className="grid">
        <div className="col-12">
          <h1>Support technique</h1>
          <p>Notre équipe est là pour vous aider. Remplissez le formulaire ci-dessous ou consultez vos tickets existants.</p>
        </div>

        <div className="col-12 md:col-8">
          <Card title="Nouvelle demande de support" className="mb-4">
            {isSuccess && (
              <Message
                severity="success"
                text="Votre demande a été envoyée avec succès !"
                className="mb-4"
              />
            )}
            {error && (
              <Message
                severity="error"
                text={error}
                className="mb-4"
              />
            )}
            <form onSubmit={handleSubmit}>
              <div className="field mb-4">
                <label htmlFor="subject" className="block text-700 font-medium mb-2">
                  Sujet <span className="text-red-500">*</span>
                </label>
                <InputText
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Décrivez brièvement votre problème"
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              <div className="field mb-4">
                <label htmlFor="message" className="block text-700 font-medium mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <InputTextarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre problème en détail..."
                  rows={5}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-content-end">
                <Button
                  label="Envoyer la demande"
                  icon="pi pi-send"
                  type="submit"
                  loading={isSubmitting}
                  disabled={!subject.trim() || !message.trim() || isSubmitting}
                />
              </div>
            </form>
          </Card>
        </div>

        <div className="col-12 md:col-4">
          <Card title="Informations de contact" className="mb-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Contact direct</h3>
              <p className="mb-1">
                <i className="pi pi-envelope mr-2"></i>
                support@vizionacademy.com
              </p>
              <p>
                <i className="pi pi-phone mr-2"></i>
                +33 1 23 45 67 89
              </p>
              <p className="text-sm text-500 mt-2">
                <i className="pi pi-info-circle mr-2"></i>
                Lundi au vendredi, 9h-18h
              </p>
            </div>

            <Divider />

            <div>
              <h3 className="text-lg font-medium mb-2">Centre d'aide</h3>
              <p className="mb-3">Consultez notre base de connaissances pour trouver des réponses aux questions fréquentes.</p>
              <Button
                label="Accéder au centre d'aide"
                icon="pi pi-question-circle"
                className="p-button-outlined w-full"
                onClick={() => window.open('https://aide.vizionacademy.com', '_blank')}
              />
            </div>
          </Card>
        </div>

        <div className="col-12">
          <SupportTickets />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
