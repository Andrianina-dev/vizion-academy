import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

interface Paiement {
    virement: string;
    dateEstimee: string;
    motif: string;
    montant: number;
    statut?: string;
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
        const fetchPaiements = async () => {
            if (!intervenantId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const API_URL = import.meta.env.VITE_API_URL;
                const response = await fetch(
                    `${API_URL}/api/paiements/intervenant/${intervenantId}/pending`,
                    {
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Erreur lors du chargement des paiements');
                }

                const data = await response.json();
                if (data?.success) {
                    setPaiements(Array.isArray(data.data) ? data.data : []);
                } else {
                    setPaiements([]);
                }
            } catch (err) {
                console.error('Erreur:', err);
                setError('Impossible de charger les paiements');
                showError('Erreur lors du chargement des paiements');
                setPaiements([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPaiements();
    }, [intervenantId, showError]);

    const handleDownload = (virementId: string) => {
        // Implémentez la logique de téléchargement ici
        console.log(`Téléchargement du virement ${virementId}`);
        // Exemple : window.open(`/api/factures/${virementId}/download`, '_blank');
    };

    if (loading) {
        return (
            <div className="flex justify-content-center p-4">
                <ProgressSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                <i className="pi pi-exclamation-triangle mr-2"></i>
                {error}
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
                        {paiements.length > 0 && (
                            <Badge value={paiements.length} className="ml-2 bg-yellow-500" />
                        )}
                    </div>
                }
                className={`shadow-sm ${className}`}
            >
                <div className="space-y-4">
                    {paiements.length === 0 ? (
                        <div className="text-center p-4">
                            <i className="pi pi-inbox text-4xl text-gray-400 mb-2"></i>
                            <p className="text-gray-500">Aucun paiement en attente</p>
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
                                        value={paiement.motif === '-' ? 'En attente' : paiement.motif}
                                        severity={paiement.statut === 'en attente' ? 'warning' : 'success'}
                                    />
                                </div>
                                <div className="flex justify-content-between align-items-center mt-3">
                                    <div>
                                        <div className="text-sm text-gray-500">Montant</div>
                                        <div className="font-bold text-lg text-green-600">
                                            {paiement.montant?.toFixed(2)} €
                                        </div>
                                    </div>
                                    <Button
                                        icon="pi pi-download"
                                        label="Télécharger"
                                        className="p-button-outlined p-button-sm"
                                        onClick={() => handleDownload(paiement.virement)}
                                    />
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
