import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL + '/api';

// Interfaces pour les réponses API
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    count?: number;
}

export interface IntervenantFavori {
    id_intervenant: string;
    nom_intervenant: string;
    prenom_intervenant: string;
    nom_complet: string;
    photo_intervenant?: string;
    bio_intervenant?: string;
    domaines?: string[];
    langues?: string[];
    ville?: string;
    disponibilite?: boolean;
    diplome?: string;
    cv?: string;
    video?: string;
    is_favori: boolean;
    has_collaborated: boolean;
    nombre_missions: number;
    date_ajout?: string;
}

export interface Stats {
    total_favoris: number;
    intervenants_collabores: number;
    favoris_collabores: number;
}

class FavorisService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
        });

        // Intercepteur pour les requêtes
        this.api.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                console.log(`🔄 Requête API: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                console.error('❌ Erreur requête API:', error);
                return Promise.reject(error);
            }
        );

        // Intercepteur pour les réponses
        this.api.interceptors.response.use(
            (response: AxiosResponse) => {
                console.log(`✅ Réponse API: ${response.status} ${response.config.url}`);
                return response;
            },
            (error) => {
                console.error('❌ Erreur réponse API:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    message: error.message
                });
                return Promise.reject(error);
            }
        );
    }

    /**
     * Récupérer les intervenants favoris d'une école
     * Route correcte : /api/intervenants/favoris/{ecoleId}
     */
    async getIntervenantsFavoris(ecoleId: string): Promise<ApiResponse<IntervenantFavori[]>> {
        try {
            const response = await this.api.get<ApiResponse<IntervenantFavori[]>>(
                `/intervenants/favoris/${ecoleId}`
            );
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }

    // Ajouter un intervenant aux favoris
    async ajouterFavori(ecoleId: string, intervenantId: string): Promise<ApiResponse> {
        try {
            const response = await this.api.post('/favoris', {
                ecole_id: ecoleId,
                intervenant_id: intervenantId
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }

    // Supprimer un intervenant des favoris
    async supprimerFavori(ecoleId: string, intervenantId: string): Promise<ApiResponse> {
        try {
            const response = await this.api.delete('/favoris', {
                data: { ecole_id: ecoleId, intervenant_id: intervenantId }
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }

    // Vérifier si un intervenant est en favoris
    async verifierFavori(ecoleId: string, intervenantId: string): Promise<ApiResponse<{ is_favori: boolean }>> {
        try {
            const response = await this.api.get(
                `/favoris/check?ecole_id=${ecoleId}&intervenant_id=${intervenantId}`
            );
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }

    // Vérifier si un intervenant a collaboré
    async verifierCollaboration(ecoleId: string, intervenantId: string): Promise<ApiResponse<{ has_collaborated: boolean }>> {
        try {
            const response = await this.api.get(
                `/favoris/check-collaboration?ecole_id=${ecoleId}&intervenant_id=${intervenantId}`
            );
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }

    // Récupérer les statistiques
    async getStats(ecoleId: string): Promise<ApiResponse<Stats>> {
        try {
            const response = await this.api.get(`/favoris/stats?ecole_id=${ecoleId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error;
        }
    }
}

export default new FavorisService();
