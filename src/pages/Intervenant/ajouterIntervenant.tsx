// src/pages/Intervenant/ajouterIntervenant.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Message } from 'primereact/message';
import { classNames } from 'primereact/utils';
import { addIntervenant } from '../../services/intervenantService';
import { InputMask } from 'primereact/inputmask';
import type { InputMaskChangeEvent } from 'primereact/inputmask';


interface FormData {
    nom_intervenant: string;
    prenom_intervenant: string;
    email_login: string;
    telephone: string;
    mot_de_passe: string;
}

const AjouterIntervenant: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        nom_intervenant: '',
        prenom_intervenant: '',
        email_login: '',
        telephone: '',
        mot_de_passe: ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handlePhoneChange = (e: InputMaskChangeEvent) => {
        const value = e.value || '';
        setFormData(prev => ({ ...prev, telephone: value as string }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nom_intervenant.trim()) {
            newErrors.nom_intervenant = 'Le nom est requis';
        }

        if (!formData.prenom_intervenant.trim()) {
            newErrors.prenom_intervenant = 'Le prénom est requis';
        }

        if (!formData.email_login.trim()) {
            newErrors.email_login = 'L\'email est requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email_login)) {
            newErrors.email_login = 'Veuillez entrer un email valide';
        }

        if (!formData.mot_de_passe) {
            newErrors.mot_de_passe = 'Le mot de passe est requis';
        } else if (formData.mot_de_passe.length < 8) {
            newErrors.mot_de_passe = 'Le mot de passe doit contenir au moins 8 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await addIntervenant(formData);

            if (response.success) {
                setSuccess(true);
                // Rediriger vers la page de connexion après 2 secondes
                setTimeout(() => {
                    navigate('/login-intervenant');
                }, 2000);
            } else {
                if (response.errors) {
                    // Gestion des erreurs de validation du serveur
                    const serverErrors: Record<string, string> = {};
                    Object.entries(response.errors).forEach(([field, messages]) => {
                        if (Array.isArray(messages) && messages.length > 0) {
                            serverErrors[field] = messages[0];
                        }
                    });
                    setErrors(serverErrors);
                } else {
                    setError(response.message || "Erreur lors de l'inscription");
                }
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    const getFormErrorMessage = (name: string) => {
        return errors[name] && <small className="p-error block mt-1">{errors[name]}</small>;
    };

    return (
        <div className="p-4">
            <div className="flex justify-content-center">
                <div className="w-full" style={{ maxWidth: '800px' }}>
                    <Card
                        title="Rejoindre notre réseau d'experts"
                        subTitle="Créez votre compte intervenant en quelques étapes simples"
                        className="shadow-3"
                    >
                        <form onSubmit={handleSubmit} className="p-fluid">
                            {error && (
                                <div className="mb-4">
                                    <Message
                                        severity="error"
                                        text={error}
                                    />
                                </div>
                            )}

                            {success && (
                                <Message
                                    severity="success"
                                    text="Inscription réussie ! Redirection vers la page de connexion..."
                                    className="mb-4"
                                />
                            )}

                            <div className="grid">
                                {/* Nom et Prénom */}
                                <div className="col-12 md:col-6">
                                    <div className="field mb-4">
                                        <label htmlFor="nom_intervenant" className="block text-600 text-sm font-medium mb-2">
                                            Nom <span className="text-red-500">*</span>
                                        </label>
                                        <InputText
                                            id="nom_intervenant"
                                            name="nom_intervenant"
                                            value={formData.nom_intervenant}
                                            onChange={handleChange}
                                            className={classNames('w-full', { 'p-invalid': errors.nom_intervenant })}
                                        />
                                        {getFormErrorMessage('nom_intervenant')}
                                    </div>
                                </div>

                                <div className="col-12 md:col-6">
                                    <div className="field mb-4">
                                        <label htmlFor="prenom_intervenant" className="block text-600 text-sm font-medium mb-2">
                                            Prénom <span className="text-red-500">*</span>
                                        </label>
                                        <InputText
                                            id="prenom_intervenant"
                                            name="prenom_intervenant"
                                            value={formData.prenom_intervenant}
                                            onChange={handleChange}
                                            className={classNames('w-full', { 'p-invalid': errors.prenom_intervenant })}
                                        />
                                        {getFormErrorMessage('prenom_intervenant')}
                                    </div>
                                </div>
                            </div>

                            <div className="field mb-4">
                                <label htmlFor="email_login" className="block text-600 text-sm font-medium mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <InputText
                                    id="email_login"
                                    name="email_login"
                                    type="email"
                                    value={formData.email_login}
                                    onChange={handleChange}
                                    className={classNames('w-full', { 'p-invalid': errors.email_login })}
                                    placeholder="exemple@email.com"
                                />
                                {getFormErrorMessage('email_login')}
                            </div>

                            <div className="field mb-4">
                                <label htmlFor="telephone" className="block text-600 text-sm font-medium mb-2">
                                    Téléphone <span className="text-red-500">*</span>
                                </label>
                                <InputMask
                                    id="telephone"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handlePhoneChange}
                                    mask="99 99 99 99 99"
                                    placeholder="01 23 45 67 89"
                                    className={classNames('w-full', { 'p-invalid': errors.telephone })}
                                />
                                {getFormErrorMessage('telephone')}
                            </div>

                            <div className="field mb-4">
                                <label htmlFor="mot_de_passe" className="block text-600 text-sm font-medium mb-2">
                                    Mot de passe <span className="text-red-500">*</span>
                                </label>
                                <Password
                                    id="mot_de_passe"
                                    name="mot_de_passe"
                                    value={formData.mot_de_passe}
                                    onChange={handleChange}
                                    toggleMask
                                    feedback={false}
                                    className={classNames('w-full', { 'p-invalid': errors.mot_de_passe })}
                                    placeholder="Saisir mot de passe"
                                />
                                {getFormErrorMessage('mot_de_passe')}
                            </div>


                            <div className="flex justify-content-end mt-5">
                                <Button
                                    type="submit"
                                    label="S'inscrire"
                                    icon="pi pi-user-plus"
                                    loading={loading}
                                    className="p-button-success"
                                />
                            </div>

                            <div className="text-center mt-4">
                                <p className="text-600">
                                    Vous avez déjà un compte ?{' '}
                                    <a
                                        href="/login-intervenant"
                                        className="text-primary-600 hover:underline cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('/login-intervenant');
                                        }}
                                    >
                                        Connectez-vous ici
                                    </a>
                                </p>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AjouterIntervenant;
