import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createEcole } from '../../services/ecoleService';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';

const CreateEcole: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nom_ecole: '',
        email: '',
        mot_de_passe: '',
        telephone: '',
        adresse: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const isFormFieldInvalid = (name: string) => {
        const fieldValue = form[name as keyof typeof form];
        return submitted && (!fieldValue || fieldValue.trim() === '');
    };

    const getFormErrorMessage = (name: string) => {
        return isFormFieldInvalid(name) && (
            <small className="p-error text-sm mt-1 block">
                Ce champ est obligatoire
            </small>
        );
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        
        // Validation des champs requis
        if (!form.nom_ecole.trim() || !form.email.trim() || !form.mot_de_passe.trim()) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const res = await createEcole({
                nom_ecole: form.nom_ecole,
                email: form.email,
                mot_de_passe: form.mot_de_passe,
                telephone: form.telephone || undefined,
                adresse: form.adresse || undefined,
            });
            
            if (res.success) {
                setSuccess('École créée avec succès ! Redirection...');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setError(res.message || "Impossible de créer l'école");
            }
        } catch (err: any) {
            setError(typeof err === 'string' ? err : (err?.message || "Une erreur est survenue"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen surface-ground p-3">
            {/* Header avec titre */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-900 mb-2">Créer votre école</h1>
                <p className="text-600 m-0">
                    Complétez le formulaire pour créer votre établissement scolaire
                </p>
            </div>

            <Divider />

            {/* Message d'information */}
            {!submitted && (
                <Message 
                    severity="info" 
                    text="Tous les champs marqués d'un astérisque (*) sont obligatoires"
                    className="w-full mb-4 border-round-lg"
                    icon="pi pi-info-circle"
                />
            )}

            {error && (
                <Message 
                    severity="error" 
                    text={error}
                    className="w-full mb-4 border-round-lg"
                    icon="pi pi-exclamation-triangle"
                />
            )}
            {success && (
                <Message 
                    severity="success" 
                    text={success}
                    className="w-full mb-4 border-round-lg"
                    icon="pi pi-check-circle"
                />
            )}

            {/* Formulaire */}
            <Card className="shadow-2 border-round-lg surface-card">
                <form onSubmit={onSubmit} className="grid gap-4">
                    {/* Nom de l'école */}
                    <div className="field">
                        <label htmlFor="nom_ecole" className="font-medium text-900 block mb-2">
                            Nom de l'école <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="nom_ecole"
                            name="nom_ecole"
                            value={form.nom_ecole}
                            onChange={onChange}
                            placeholder="Ex: Lycée Alpha"
                            className={classNames('w-full', { 
                                'p-invalid': isFormFieldInvalid('nom_ecole')
                            })}
                        />
                        {getFormErrorMessage('nom_ecole')}
                    </div>

                    {/* Email */}
                    <div className="field">
                        <label htmlFor="email" className="font-medium text-900 block mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            placeholder="contact@ecole.fr"
                            className={classNames('w-full', { 
                                'p-invalid': isFormFieldInvalid('email')
                            })}
                            keyfilter="email"
                        />
                        {getFormErrorMessage('email')}
                    </div>

                    {/* Mot de passe */}
                    <div className="field">
                        <label htmlFor="mot_de_passe" className="font-medium text-900 block mb-2">
                            Mot de passe <span className="text-red-500">*</span>
                        </label>
                        <Password
                            id="mot_de_passe"
                            name="mot_de_passe"
                            value={form.mot_de_passe}
                            onChange={onChange}
                            placeholder="••••••••"
                            toggleMask
                            feedback={false}
                            className="w-full"
                            inputClassName={classNames('w-full', { 
                                'p-invalid': isFormFieldInvalid('mot_de_passe')
                            })}
                        />
                        {getFormErrorMessage('mot_de_passe')}
                    </div>

                    {/* Téléphone */}
                    <div className="field">
                        <label htmlFor="telephone" className="font-medium text-900 block mb-2">
                            Téléphone
                        </label>
                        <InputText
                            id="telephone"
                            name="telephone"
                            value={form.telephone}
                            onChange={onChange}
                            placeholder="0123456789"
                            className="w-full"
                            keyfilter="num"
                        />
                    </div>

                    {/* Adresse */}
                    <div className="field">
                        <label htmlFor="adresse" className="font-medium text-900 block mb-2">
                            Adresse
                        </label>
                        <InputText
                            id="adresse"
                            name="adresse"
                            value={form.adresse}
                            onChange={onChange}
                            placeholder="10 Rue X, Paris"
                            className="w-full"
                        />
                    </div>

                    <Divider />

                    {/* Boutons d'action */}
                    <div className="flex justify-content-between align-items-center gap-3">
                        <Link to="/" className="no-underline">
                            <Button 
                                label="Retour" 
                                icon="pi pi-arrow-left" 
                                text
                                severity="secondary"
                            />
                        </Link>
                        
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                label="Réinitialiser"
                                icon="pi pi-refresh"
                                severity="secondary"
                                onClick={() => {
                                    setForm({
                                        nom_ecole: '',
                                        email: '',
                                        mot_de_passe: '',
                                        telephone: '',
                                        adresse: '',
                                    });
                                    setSubmitted(false);
                                    setError(null);
                                }}
                            />
                            <Button
                                type="submit"
                                label={loading ? "Création..." : "Créer l'école"}
                                icon={loading ? "pi pi-spin pi-spinner" : "pi pi-check"}
                                loading={loading}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </form>

                {loading && (
                    <div className="flex justify-content-center align-items-center mt-4">
                        <div className="flex align-items-center gap-2">
                            <ProgressSpinner 
                                style={{ width: '24px', height: '24px' }} 
                                strokeWidth="4"
                            />
                            <span className="text-600 text-sm">Création en cours...</span>
                        </div>
                    </div>
                )}
            </Card>

            {/* Informations supplémentaires */}
            <div className="text-center mt-4">
                <p className="text-600 text-sm">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline no-underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default CreateEcole;