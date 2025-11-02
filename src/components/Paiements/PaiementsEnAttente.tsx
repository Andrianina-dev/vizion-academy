import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';

interface Mission {
    id_mission: string;
    ecole: string;
    date: string;
    taux_horaire: number;
    heures: number;
    intitule: string;
    total: number;
    tauxHoraire?: number;
    nombreHeures?: number;
}

interface Paiement {
    id_facture: string;
    virement: string;
    date_estimee: string;
    motif: string;
    statut: 'en attente' | 'validé' | 'bloqué';
    mission: Mission;
    motifBlocage?: string;
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

    // Fonction pour formater les nombres avec 2 décimales
    const formatMontant = (montant: number | string | undefined): string => {
        if (montant === undefined || montant === null) return '0.00';
        const num = typeof montant === 'string' ? parseFloat(montant) : montant;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    // Fonction pour obtenir la sévérité du statut
    const getStatusSeverity = (statut: string) => {
        switch (statut) {
            case 'validé': return 'success';
            case 'bloqué': return 'danger';
            case 'en attente': return 'warning';
            default: return 'info';
        }
    };

    // Fonction pour obtenir l'icône du statut
    const getStatusIcon = (statut: string) => {
        switch (statut) {
            case 'validé': return 'pi pi-check-circle';
            case 'bloqué': return 'pi pi-exclamation-triangle';
            case 'en attente': return 'pi pi-clock';
            default: return 'pi pi-info-circle';
        }
    };

    useEffect(() => {
        if (!intervenantId) {
            setLoading(false);
            return;
        }
        
        const fetchPaiements = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `https://government-crystal-spin-sue.trycloudflare.com/api/paiements/intervenant/${intervenantId}/pending`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        mode: 'cors'
                    }
                );

                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }

                const data = await response.json();
                
                if (data?.success && Array.isArray(data.data)) {
                    setPaiements(data.data);
                } else {
                    setPaiements([]);
                    setError("Aucune donnée de paiement disponible");
                }
            } catch (error) {
                console.error('Erreur:', error);
                setError("Impossible de charger les paiements. Veuillez réessayer plus tard.");
            } finally {
                setLoading(false);
            }
        };

        fetchPaiements();
    }, [intervenantId]);

    const handleDownload = (virementId: string) => {
        // Implémentez la logique de téléchargement ici
        console.log(`Téléchargement du virement ${virementId}`);
        toast.current?.show({
            severity: 'info',
            summary: 'Téléchargement',
            detail: `Facture ${virementId} en cours de téléchargement`,
            life: 3000
        });
    };

    const getDaysUntilPayment = (dateEstimee: string): number => {
        const today = new Date();
        const paymentDate = new Date(dateEstimee);
        const diffTime = paymentDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex justify-content-center align-items-center p-6">
                <ProgressSpinner />
            </div>
        );
    }

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
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-clock text-yellow-500 text-xl"></i>
                            <span className="text-xl font-bold">Paiements en Attente</span>
                        </div>
                        {paiements.length > 0 && (
                            <Badge 
                                value={paiements.length} 
                                className="ml-2 bg-yellow-500 text-white" 
                            />
                        )}
                    </div>
                }
                className={`shadow-2 border-round-xl ${className}`}
            >
                {/* Résumé global */}
                {paiements.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border-round-lg border-1 border-blue-200">
                        <div className="grid">
                            <div className="col-12 md:col-4 text-center">
                                <div className="text-sm font-semibold text-blue-600 mb-1">Total en attente</div>
                                <div className="text-2xl font-bold text-blue-800">
                                    {formatMontant(paiements.reduce((sum, p) => sum + (p.mission.total || 0), 0))} €
                                </div>
                            </div>
                            <div className="col-12 md:col-4 text-center">
                                <div className="text-sm font-semibold text-blue-600 mb-1">Nombre de paiements</div>
                                <div className="text-2xl font-bold text-blue-800">{paiements.length}</div>
                            </div>
                            <div className="col-12 md:col-4 text-center">
                                <div className="text-sm font-semibold text-blue-600 mb-1">Prochain paiement</div>
                                <div className="text-lg font-bold text-blue-800">
                                    {paiements.length > 0 
                                        ? new Date(paiements[0].date_estimee).toLocaleDateString('fr-FR')
                                        : '-'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {paiements.length === 0 ? (
                        <div className="text-center p-6">
                            <i className="pi pi-inbox text-5xl text-gray-300 mb-3"></i>
                            <h4 className="text-gray-500 font-normal mb-2">Aucun paiement en attente</h4>
                            <p className="text-gray-400 text-sm">Tous vos paiements à ce jour ont été traités.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {paiements.map((paiement) => {
                                const daysUntil = getDaysUntilPayment(paiement.date_estimee);
                                
                                return (
                                    <div 
                                        key={paiement.virement} 
                                        className="p-5 bg-white border-round-lg border-1 border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                                    >
                                        {/* En-tête avec statut et identifiants */}
                                        <div className="flex flex-column lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
                                            <div className="flex align-items-center gap-3">
                                                <i className={`${getStatusIcon(paiement.statut)} text-xl`} 
                                                   style={{ 
                                                       color: paiement.statut === 'en attente' ? '#eab308' : 
                                                              paiement.statut === 'validé' ? '#22c55e' : '#ef4444'
                                                   }}></i>
                                                <div>
                                                    <div className="font-bold text-gray-800 text-lg">
                                                        Virement #{paiement.virement}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Facture: {paiement.id_facture}
                                                    </div>
                                                </div>
                                            </div>
                                            <Tag 
                                                value={paiement.statut.charAt(0).toUpperCase() + paiement.statut.slice(1)}
                                                severity={getStatusSeverity(paiement.statut)}
                                                className="font-medium text-sm px-3 py-1"
                                            />
                                        </div>

                                        {/* Section d'alerte pour les blocages */}
                                        {(paiement.motif && paiement.motif !== '-') && (
                                            <div className="p-3 mb-4 bg-red-50 border-left-3 border-red-400 border-round-right">
                                                <div className="flex align-items-center gap-2">
                                                    <i className="pi pi-exclamation-circle text-red-500"></i>
                                                    <div>
                                                        <div className="font-semibold text-red-700 text-sm">Attention requis</div>
                                                        <p className="text-sm text-red-600 mt-1">{paiement.motif}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Grille d'informations principales */}
                                        <div className="grid gap-4 mb-4">
                                            <div className="col-12 md:col-6 lg:col-3">
                                                <div className="text-sm font-semibold text-gray-500 mb-2">
                                                    <i className="pi pi-calendar mr-2"></i>
                                                    Date estimée
                                                </div>
                                                <div className="flex align-items-center gap-2">
                                                    <span className="font-bold text-gray-800">
                                                        {new Date(paiement.date_estimee).toLocaleDateString('fr-FR', { 
                                                            day: 'numeric', 
                                                            month: 'long', 
                                                            year: 'numeric' 
                                                        })}
                                                    </span>
                                                    {daysUntil > 0 && (
                                                        <Tag 
                                                            value={`Dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`}
                                                            severity="info"
                                                            className="text-xs"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-12 md:col-6 lg:col-3">
                                                <div className="text-sm font-semibold text-gray-500 mb-2">
                                                    <i className="pi pi-briefcase mr-2"></i>
                                                    Mission
                                                </div>
                                                <div className="font-medium text-gray-800">{paiement.mission.intitule}</div>
                                            </div>

                                            <div className="col-12 md:col-6 lg:col-3">
                                                <div className="text-sm font-semibold text-gray-500 mb-2">
                                                    <i className="pi pi-building mr-2"></i>
                                                    Établissement
                                                </div>
                                                <div className="text-gray-800">{paiement.mission.ecole}</div>
                                            </div>

                                            <div className="col-12 md:col-6 lg:col-3">
                                                <div className="text-sm font-semibold text-gray-500 mb-2">
                                                    <i className="pi pi-euro mr-2"></i>
                                                    Montant total
                                                </div>
                                                <div className="text-xl font-bold text-green-600">
                                                    {formatMontant(paiement.mission.total)} €
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {paiement.mission.heures}h × {paiement.mission.taux_horaire} €/h
                                                </div>
                                            </div>
                                        </div>

                                        {/* Détails de la mission */}
                                        <div className="p-4 bg-gray-50 border-round-lg mb-4">
                                            <h5 className="font-semibold text-gray-900 mb-3 flex align-items-center gap-2">
                                                <i className="pi pi-info-circle text-blue-500"></i>
                                                Détails de la mission
                                            </h5>
                                            <div className="grid gap-3">
                                                <div className="col-12 sm:col-6 lg:col-3 flex align-items-center gap-2">
                                                    <i className="pi pi-calendar text-gray-400"></i>
                                                    <span className="text-sm text-gray-600">
                                                        {paiement.mission.date ? 
                                                            new Date(paiement.mission.date).toLocaleDateString('fr-FR') : 
                                                            'Non définie'}
                                                    </span>
                                                </div>
                                                <div className="col-12 sm:col-6 lg:col-3 flex align-items-center gap-2">
                                                    <i className="pi pi-clock text-gray-400"></i>
                                                    <span className="text-sm text-gray-600">
                                                        {paiement.mission.heures || 0} heures
                                                    </span>
                                                </div>
                                                <div className="col-12 sm:col-6 lg:col-3 flex align-items-center gap-2">
                                                    <i className="pi pi-euro text-gray-400"></i>
                                                    <span className="text-sm text-gray-600">
                                                        {paiement.mission.taux_horaire?.toFixed(2)} €/h
                                                    </span>
                                                </div>
                                                <div className="col-12 sm:col-6 lg:col-3 flex align-items-center gap-2">
                                                    <i className="pi pi-calculator text-gray-400"></i>
                                                    <span className="text-sm font-semibold text-gray-700">
                                                        Total: {formatMontant(paiement.mission.total)} €
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-column sm:flex-row justify-between align-items-center gap-3 pt-4 border-top-1 border-gray-200">
                                            <div className="flex align-items-center gap-2">
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {formatMontant(paiement.mission.total)} €
                                                </span>
                                                <Tag 
                                                    value="NET"
                                                    severity="success" 
                                                    className="text-xs"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    icon="pi pi-download"
                                                    label="Télécharger la facture"
                                                    className="p-button-outlined p-button-sm"
                                                    onClick={() => paiement.virement && handleDownload(paiement.virement)}
                                                    disabled={!paiement.virement}
                                                />
                                                <Button
                                                    icon="pi pi-eye"
                                                    label="Détails"
                                                    className="p-button-secondary p-button-sm"
                                                    onClick={() => console.log('Voir détails:', paiement.virement)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
};

export default PaiementsEnAttente;