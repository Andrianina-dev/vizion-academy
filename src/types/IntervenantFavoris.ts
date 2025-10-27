export interface IntervenantFavori {
    id_intervenant: string;
    nom_intervenant: string;
    prenom_intervenant: string;
    email_login: string;
    mot_de_passe: string;
    photo_intervenant: string;
    bio_intervenant: string;
    diplome: string;
    cv: string;
    video: string;
    langues?: string[] | null;
    domaines?: string[] | null;
    ville: string;
    disponibilite: number;
    date_derniere_connexion?: string | null;
    date_creation: string;
}
