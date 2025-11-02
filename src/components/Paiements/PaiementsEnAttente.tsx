import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

interface Mission {
    ecole: string;
    date: string;
    tauxHoraire: number;
    nombreHeures: number;
    intitule: string;
}

interface Paiement {
    virement: string;
    dateEstimee: string;
    motifBlocage?: string;
    montant: number;
    statut: 'en attente' | 'validé' | 'bloqué';
    missions: Mission[];
}

interface PaiementsEnAttenteProps {
    intervenantId: string | null;
    className?: string;
}

const PaiementsEnAttente: React.FC<PaiementsEnAttenteProps> = ({
    intervenantId,
    className = ''
}) => {
    const [paiements, setPaiements] = useState<Paiement[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    const showError = (message: string) => {
        toast.current?.show({
            severity: 'error',
            summary: 'Erreur',
            detail: message,
            life: 5000,
        });
    };

    useEffect(() => {
        let isMounted = true;
        let controller: AbortController | null = null;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const fetchPaiements = async () => {
            if (!intervenantId) {
                if (isMounted) {
                    setLoading(false);
                    setError('Aucun identifiant d\'intervenant fourni');
                }
                return;
            }

            // Créer un nouveau contrôleur pour chaque requête
            controller = new AbortController();
            
            // Configurer le timeout
            timeoutId = setTimeout(() => {
                if (controller) {
                    controller.abort();
                }
            }, 10000);

            try {
                if (isMounted) setLoading(true);
                
                const API_URL = import.meta.env.VITE_API_URL;
                const response = await fetch(
                    `${API_URL}/api/paiements/intervenant/${intervenantId}/pending`,
                    {
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        signal: controller.signal
                    }
                );

                // Nettoyer le timeout car la requête a réussi
                if (timeoutId) clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                const data = await response.json();
                
                if (!isMounted) return;
                
                if (data?.success && Array.isArray(data.data)) {
                    setPaiements(data.data);
                    setError(null);
                } else {
                    setPaiements([]);
                    setError('Aucune donnée valide reçue');
                }
            } catch (error) {
                if (!isMounted) return;
                
                // Ne pas afficher d'erreur si la requête a été annulée intentionnellement
                if (error instanceof Error && error.name === 'AbortError') {
                    console.log('Requête annulée');
                    return;
                }
                
                const errorMessage = error instanceof Error 
                    ? `Erreur lors du chargement des paiements: ${error.message}`
                    : 'Une erreur inconnue est survenue';
                
                console.error('Erreur:', error);
                setError(errorMessage);
                showError(errorMessage);
                setPaiements([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPaiements();
        
        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
            if (controller) controller.abort();
        };
    }, [intervenantId]);

    const handleDownload = (virementId: string) => {
        // Implémentez la logique de téléchargement ici
        console.log(`Téléchargement du virement ${virementId}`);
        // Exemple : window.open(`/api/factures/${virementId}/download`, '_blank');
    };

    // Suppression de l'écran de chargement initial

    if (error) {
        return (
            <div className="p-6 text-center">
                <i className="pi pi-exclamation-triangle text-4xl text-red-500 mb-3"></i>
                <p className="text-red-500 font-medium">{error}</p>
                <Button 
                    label="Réessayer" 
                    icon="pi pi-refresh" 
                    className="p-button-text mt-2"
                    onClick={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <>
            <Toast ref={toast} />
            <Card
                title={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-clock text-yellow-500"></i>
                        <span>Paiements en Attente</span>
                        {loading ? (
                            <i className="pi pi-spin pi-spinner ml-2"></i>
                        ) : (
                            paiements.length > 0 && (
                                <Badge value={paiements.length} className="ml-2 bg-yellow-500" />
                            )
                        )}
                    </div>
                }
                className={`shadow-sm ${className}`}
            >
                <div className="space-y-4">
                    {paiements.length === 0 ? (
                        <div className="text-center p-6">
                            <i className="pi pi-inbox text-5xl text-gray-300 mb-3"></i>
                            <h4 className="text-gray-500 font-normal mb-2">Aucun paiement en attente</h4>
                            <p className="text-gray-400 text-sm">Tous vos paiements à ce jour ont été traités.</p>
                        </div>
                    ) : (
                        paiements.map((paiement) => (
                            <div key={paiement.virement} className="p-4 border-round-xl border-1 surface-100">
                                <div className="flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <div className="font-semibold text-gray-900">Virement {paiement.virement}</div>
                                        <div className="text-sm text-gray-500">
                                            Date estimée: {new Date(paiement.dateEstimee).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Tag
                                        value={paiement.statut.charAt(0).toUpperCase() + paiement.statut.slice(1)}
                                        severity={
                                            paiement.statut === 'en attente' ? 'warning' :
                                            paiement.statut === 'validé' ? 'success' : 'danger'
                                        }
                                    />
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Missions concernées :</h4>
                                    <div className="space-y-3">
                                        {paiement.missions.map((mission, index) => (
                                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{mission.intitule}</p>
                                                        <p className="text-sm text-gray-600">{mission.ecole}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(mission.date).toLocaleDateString()} - {mission.nombreHeures}h
                                                            <span className="mx-2">•</span>
                                                            {mission.tauxHoraire.toFixed(2)}€/h
                                                        </p>
                                                    </div>
                                                    <span className="font-semibold">
                                                        {(mission.tauxHoraire * mission.nombreHeures).toFixed(2)}€
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {paiement.motifBlocage && (
                                    <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 rounded-r">
                                        <div className="flex items-start">
                                            <i className="pi pi-exclamation-circle text-red-500 mt-1 mr-2"></i>
                                            <div>
                                                <p className="font-medium text-red-700">Motif de blocage :</p>
                                                <p className="text-sm text-red-600">{paiement.motifBlocage}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                                    <div className="text-sm text-gray-500">
                                        Virement prévu le {new Date(paiement.dateEstimee).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-xl font-bold text-gray-900 mr-3">
                                            {paiement.montant.toFixed(2)} €
                                        </span>
                                        <Button
                                            icon="pi pi-download"
                                            className="p-button-rounded p-button-text"
                                            onClick={() => handleDownload(paiement.virement)}
                                            tooltip="Télécharger la facture"
                                            tooltipOptions={{ position: 'top' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </>
    );
};

export default PaiementsEnAttente;
