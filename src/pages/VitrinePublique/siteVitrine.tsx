import { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Menubar } from 'primereact/menubar';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataView } from 'primereact/dataview';
import { Divider } from 'primereact/divider';
import { useNavigate } from 'react-router-dom';

// Types TypeScript
interface Intervenant {
    id: number;
    nom: string;
    specialite: string;
    photo: string;
    bio: string;
    diplomes: string[];
    experience: string;
    langues: string[];
    domaines: string[];
}

interface Challenge {
    id: number;
    titre: string;
    description: string;
    duree: string;
    niveau: string;
}

interface DropdownOption {
    label: string;
    value: string;
}

const SiteVitrine = () => {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const navigate = useNavigate();
    
    // Données des intervenants
    const intervenants: Intervenant[] = [
        {
            id: 1,
            nom: "Sophie Martin",
            specialite: "Formatrice en Neurosciences Appliquées",
            photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            bio: "15 ans d'expérience dans la formation des adultes et l'application des neurosciences à l'apprentissage.",
            diplomes: ["PhD en Sciences Cognitives", "Master en Pédagogie"],
            experience: "15 ans",
            langues: ["Français", "Anglais"],
            domaines: ["Neurosciences", "Pédagogie adulte", "Formation continue"]
        },
        {
            id: 2,
            nom: "Thomas Leroy",
            specialite: "Expert en Pédagogie Digitale",
            photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
            bio: "Spécialiste des technologies éducatives et de la conception de parcours d'apprentissage en ligne.",
            diplomes: ["Master en Ingénierie Pédagogique", "Certification EdTech"],
            experience: "8 ans",
            langues: ["Français", "Anglais", "Espagnol"],
            domaines: ["Digital Learning", "EdTech", "MOOC"]
        }
    ];

    // Données des challenges
    const challenges: Challenge[] = [
        {
            id: 1,
            titre: "Challenge 'Apprentissage Accéléré'",
            description: "Un programme intensif de 5 jours pour maîtriser les techniques d'apprentissage accéléré.",
            duree: "5 jours",
            niveau: "Intermediaire"
        },
        {
            id: 2,
            titre: "Challenge 'Leadership Éducatif'",
            description: "Développez vos compétences de leadership dans un contexte éducatif.",
            duree: "3 semaines",
            niveau: "Avancé"
        }
    ];

    // Options pour les dropdowns
    const sujetOptions: DropdownOption[] = [
        { label: 'Demande d\'information', value: 'info' },
        { label: 'Proposition de partenariat', value: 'partenariat' },
        { label: 'Devenir intervenant', value: 'intervenant' }
    ];

    // Items de navigation
    const navItems = [
        { label: 'Accueil', icon: 'pi pi-home', command: () => setActiveIndex(0) },
        { label: 'Écoles', icon: 'pi pi-building', command: () => setActiveIndex(1) },
        { label: 'Intervenants', icon: 'pi pi-users', command: () => setActiveIndex(2) },
        { label: 'Challenges', icon: 'pi pi-book', command: () => setActiveIndex(3) },
        { label: 'Contact', icon: 'pi pi-envelope', command: () => setActiveIndex(4) }
    ];

    // Template pour la grille d'intervenants
    const intervenantTemplate = (intervenant: Intervenant) => {
        return (
            <div className="col-12 md:col-6 lg:col-4 p-2">
                <Card 
                    title={intervenant.nom}
                    subTitle={intervenant.specialite}
                    header={<img alt={intervenant.nom} src={intervenant.photo} className="w-full h-15rem object-cover" />}
                    footer={
                        <div className="flex gap-2">
                            <Button label="Voir profil" icon="pi pi-user" className="p-button-outlined" />
                            <Button label="Contacter" icon="pi pi-envelope" />
                        </div>
                    }
                >
                    <p className="m-0">{intervenant.bio}</p>
                    <div className="mt-3">
                        <small className="text-500">Expérience: {intervenant.experience}</small>
                    </div>
                </Card>
            </div>
        );
    };

    // Template pour les challenges
    const challengeTemplate = (challenge: Challenge) => {
        return (
            <div className="col-12 md:col-6 p-2">
                <Card 
                    title={challenge.titre}
                    footer={
                        <div className="flex gap-2">
                            <Button label="Détails" icon="pi pi-info-circle" className="p-button-outlined" />
                            <Button label="S'inscrire" icon="pi pi-check" />
                        </div>
                    }
                >
                    <p>{challenge.description}</p>
                    <div className="flex justify-content-between mt-3">
                        <small className="text-500">Durée: {challenge.duree}</small>
                        <small className="text-500">Niveau: {challenge.niveau}</small>
                    </div>
                </Card>
            </div>
        );
    };

    const start = <span className="text-xl font-bold text-blue-500">EduChallenge</span>;

    // Fonction pour la connexion en tant qu'école
    const handleLoginEcole = () => {
        navigate('/login', { state: { role: 'ecole' } });
    };

    // Fonction pour la connexion en tant qu'intervenant - MODIFIÉE
    const handleLoginIntervenant = () => {
        navigate('/login-intervenant'); // Redirige vers la page de connexion spécifique intervenant
    };
    
    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <Menubar model={navItems} start={start} className="shadow-2 mb-3" />

            {/* Contenu principal avec onglets */}
            <div className="p-3">
                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    
                    {/* Onglet Accueil */}
                    <TabPanel header="Accueil">
                        <div className="text-center p-4 bg-blue-500 text-white border-round mb-4">
                            <h1 className="text-4xl font-bold mb-3">EduChallenge</h1>
                            <p className="text-xl">Plateforme d'Intervenants Pédagogiques</p>
                            <p className="mt-3 text-lg">Accédez à nos espaces principaux</p>
                        </div>

                        {/* ACCÈS AUX ESPACES PRINCIPAUX */}
                        <div className="grid mb-6">
                            <div className="col-12 md:col-4">
                                <Card 
                                    title="Espace Écoles" 
                                    className="text-center h-full border-1 surface-border"
                                    header={<i className="pi pi-building text-6xl text-blue-500 mb-3 mt-3"></i>}
                                    footer={
                                        <div className="flex flex-column gap-2">
                                            <Button 
                                                label="Accéder aux Écoles" 
                                                icon="pi pi-arrow-right" 
                                                onClick={() => setActiveIndex(1)}
                                                className="w-full"
                                            />
                                            <div className="text-center mt-2">
                                                <small>
                                                    <a 
                                                        href="#" 
                                                        onClick={handleLoginEcole}
                                                        className="text-blue-500 no-underline hover:underline"
                                                    >
                                                        Se connecter en tant qu'école
                                                    </a>
                                                </small>
                                            </div>
                                        </div>
                                    }
                                >
                                    <p>Découvrez nos établissements partenaires et leurs programmes éducatifs innovants</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-4">
                                <Card 
                                    title="Espace Intervenants" 
                                    className="text-center h-full border-1 surface-border"
                                    header={<i className="pi pi-users text-6xl text-green-500 mb-3 mt-3"></i>}
                                    footer={
                                        <div className="flex flex-column gap-2">
                                            <Button 
                                                label="Explorer les Intervenants" 
                                                icon="pi pi-arrow-right" 
                                                onClick={() => setActiveIndex(2)}
                                                className="w-full"
                                            />
                                            <div className="text-center mt-2">
                                                <small>
                                                    <a 
                                                        href="#" 
                                                        onClick={handleLoginIntervenant}
                                                        className="text-blue-500 no-underline hover:underline"
                                                    >
                                                        Se connecter en tant qu'intervenant
                                                    </a>
                                                </small>
                                            </div>
                                        </div>
                                    }
                                >
                                    <p>Rencontrez nos experts pédagogiques qualifiés dans divers domaines d'enseignement</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-4">
                                <Card 
                                    title="Espace Challenges" 
                                    className="text-center h-full border-1 surface-border"
                                    header={<i className="pi pi-book text-6xl text-purple-500 mb-3 mt-3"></i>}
                                    footer={
                                        <Button 
                                            label="Découvrir les Challenges" 
                                            icon="pi pi-arrow-right" 
                                            onClick={() => setActiveIndex(3)}
                                            className="w-full"
                                        />
                                    }
                                >
                                    <p>Participez à nos défis pédagogiques innovants et développez vos compétences</p>
                                </Card>
                            </div>
                        </div>

                        <Divider />

                        {/* SERVICES COMPLÉMENTAIRES */}
                        <h2 className="text-2xl font-bold text-center mb-4">Nos Services</h2>
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <Card title="Formations Sur Mesure" className="text-center">
                                    <i className="pi pi-cog text-5xl text-orange-500 mb-3"></i>
                                    <p>Des programmes personnalisés adaptés à vos besoins spécifiques</p>
                                </Card>
                            </div>
                            <div className="col-12 md:col-6">
                                <Card title="Accompagnement" className="text-center">
                                    <i className="pi pi-compass text-5xl text-cyan-500 mb-3"></i>
                                    <p>Un suivi personnalisé pour garantir la réussite de vos projets éducatifs</p>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Onglet Écoles */}
                    <TabPanel header="Écoles">
                        <div className="flex justify-content-between align-items-center mb-4">
                            <h2 className="text-3xl font-bold m-0">Nos Établissements Partenaires</h2>
                            <div className="text-right">
                                <small>
                                    <a 
                                        href="#" 
                                        onClick={handleLoginEcole}
                                        className="text-blue-500 no-underline hover:underline"
                                    >
                                        Se connecter en tant qu'école
                                    </a>
                                </small>
                            </div>
                        </div>
                        
                        <div className="grid">
                            <div className="col-12 md:col-6 lg:col-4 p-2">
                                <Card 
                                    title="Lycée Innovant Paris"
                                    subTitle="Établissement Public"
                                    header={<img alt="Lycée Innovant Paris" src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" className="w-full h-15rem object-cover" />}
                                    footer={
                                        <Button label="Voir l'établissement" icon="pi pi-eye" className="w-full" />
                                    }
                                >
                                    <p>Spécialisé dans les pédagogies alternatives et l'innovation éducative</p>
                                    <div className="mt-2">
                                        <small className="text-500">Programmes: Bac Général, Bac Techno</small>
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="col-12 md:col-6 lg:col-4 p-2">
                                <Card 
                                    title="École Internationale Lyon"
                                    subTitle="Établissement Privé"
                                    header={<img alt="École Internationale Lyon" src="https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" className="w-full h-15rem object-cover" />}
                                    footer={
                                        <Button label="Voir l'établissement" icon="pi pi-eye" className="w-full" />
                                    }
                                >
                                    <p>Enseignement bilingue et programmes internationaux</p>
                                    <div className="mt-2">
                                        <small className="text-500">Programmes: International Baccalaureate</small>
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="col-12 md:col-6 lg:col-4 p-2">
                                <Card 
                                    title="Campus Digital Marseille"
                                    subTitle="Centre de Formation"
                                    header={<img alt="Campus Digital Marseille" src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" className="w-full h-15rem object-cover" />}
                                    footer={
                                        <Button label="Voir l'établissement" icon="pi pi-eye" className="w-full" />
                                    }
                                >
                                    <p>Spécialiste des formations aux métiers du numérique</p>
                                    <div className="mt-2">
                                        <small className="text-500">Programmes: BTS, Licences Pro</small>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>

                    {/* Onglet Intervenants */}
                    <TabPanel header="Intervenants">
                        <div className="flex justify-content-between align-items-center mb-4">
                            <h2 className="text-3xl font-bold m-0">Notre Catalogue d'Intervenants</h2>
                            <div className="text-right">
                                <small>
                                    <a 
                                        href="#" 
                                        onClick={handleLoginIntervenant}
                                        className="text-blue-500 no-underline hover:underline"
                                    >
                                        Se connecter en tant qu'intervenant
                                    </a>
                                </small>
                            </div>
                        </div>
                        
                        <DataView 
                            value={intervenants}
                            itemTemplate={intervenantTemplate}
                            layout="grid"
                            paginator
                            rows={6}
                        />
                    </TabPanel>

                    {/* Onglet Challenges */}
                    <TabPanel header="Challenges">
                        <h2 className="text-3xl font-bold text-center mb-4">Challenges Pédagogiques</h2>
                        
                        <div className="grid mb-6">
                            {challenges.map((challenge: Challenge) => challengeTemplate(challenge))}
                        </div>

                        <Divider />

                        <h3 className="text-2xl font-bold text-center my-4">Demander un Challenge sur Mesure</h3>
                        
                        <Card className="max-w-30rem mx-auto">
                            <div className="p-fluid">
                                <div className="field">
                                    <label htmlFor="nom">Nom</label>
                                    <InputText id="nom" className="w-full" />
                                </div>
                                
                                <div className="field">
                                    <label htmlFor="email">Email</label>
                                    <InputText id="email" className="w-full" />
                                </div>
                                
                                <div className="field">
                                    <label htmlFor="organisation">Organisation</label>
                                    <InputText id="organisation" className="w-full" />
                                </div>
                                
                                <div className="field">
                                    <label htmlFor="besoin">Description de votre besoin</label>
                                    <textarea 
                                        id="besoin" 
                                        rows={5} 
                                        className="w-full p-inputtext p-component p-filled" 
                                        style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ced4da' }}
                                    />
                                </div>
                                
                                <div className="field">
                                    <label htmlFor="participants">Nombre de participants</label>
                                    <InputNumber id="participants" className="w-full" />
                                </div>
                                
                                <Button label="Envoyer la demande" icon="pi pi-send" className="w-full" />
                            </div>
                        </Card>
                    </TabPanel>

                    {/* Onglet Contact */}
                    <TabPanel header="Contact">
                        <h2 className="text-3xl font-bold text-center mb-4">Contact & Partenariats</h2>
                        
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <Card title="Nous contacter">
                                    <div className="p-fluid">
                                        <div className="field">
                                            <label htmlFor="contact-nom">Nom</label>
                                            <InputText id="contact-nom" className="w-full" />
                                        </div>
                                        
                                        <div className="field">
                                            <label htmlFor="contact-email">Email</label>
                                            <InputText id="contact-email" className="w-full" />
                                        </div>
                                        
                                        <div className="field">
                                            <label htmlFor="sujet">Sujet</label>
                                            <Dropdown 
                                                id="sujet"
                                                options={sujetOptions}
                                                placeholder="Sélectionnez un sujet"
                                                className="w-full"
                                            />
                                        </div>
                                        
                                        <div className="field">
                                            <label htmlFor="message">Message</label>
                                            <textarea 
                                                id="message" 
                                                rows={5} 
                                                className="w-full p-inputtext p-component p-filled" 
                                                style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #ced4da' }}
                                            />
                                        </div>
                                        
                                        <Button label="Envoyer le message" icon="pi pi-send" className="w-full" />
                                    </div>
                                </Card>
                            </div>
                            
                            <div className="col-12 md:col-6">
                                <Card title="Coordonnées">
                                    <div className="flex flex-column gap-3">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-map-marker text-blue-500"></i>
                                            <span>123 Avenue de l'Éducation, 75000 Paris</span>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-phone text-green-500"></i>
                                            <span>+33 1 23 45 67 89</span>
                                        </div>
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-envelope text-purple-500"></i>
                                            <span>contact@educhallenge.fr</span>
                                        </div>
                                    </div>
                                    
                                    <Divider />
                                    
                                    <h4 className="font-bold">Horaires d'ouverture</h4>
                                    <p>Lundi - Vendredi: 9h00 - 18h00</p>
                                    <p>Samedi: 10h00 - 16h00</p>
                                </Card>
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </div>

            {/* Pied de page */}
            <div className="bg-gray-900 text-white p-4 text-center mt-4">
                <div className="flex justify-content-center align-items-center gap-2 mb-2">
                    <span className="text-xl font-bold text-blue-300">EduChallenge</span>
                </div>
                <p className="text-sm">Plateforme d'intervenants pédagogiques et de challenges d'apprentissage</p>
                <p className="text-xs mt-2">&copy; 2023 EduChallenge. Tous droits réservés.</p>
            </div>
        </div>
    );
};

export default SiteVitrine;