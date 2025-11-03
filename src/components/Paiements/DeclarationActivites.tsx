import { Card } from 'primereact/card';

const DeclarationActivites = () => {
    // Header du card avec le design de l'image
    const header = (
        <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 text-white p-6 text-center rounded-t-2xl">
            {/* Texte principal avec saut de ligne exact comme sur l'image */}
            <div className="text-xl font-light leading-tight mb-6">
                Permettre aux entreprises<br />
                en difficulté de <strong className="font-bold">moduler</strong><br />
                facilement leurs paiements.
            </div>
            
            {/* Titre Solidarité */}
            <h1 className="text-5xl font-black mb-8 tracking-tight">Solidarité</h1>
            
            {/* Citation avec structure exacte */}
            <div className="bg-white text-gray-800 rounded-2xl p-5 max-w-xs mx-auto shadow-lg">
                <p className="text-xl font-bold mb-2 leading-snug">
                    C'est ça<br />
                    être engagé !
                </p>
                <p className="text-gray-500 text-sm border-t border-gray-200 pt-2">
                    Manon, Urser Carschierend
                </p>
            </div>
        </div>
    );

    // Footer du card
    const footer = (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-3">
                <span className="text-xl">📌</span>
                <span className="text-green-900 font-semibold">
                    Afficher la transcription textuelle de l'image
                </span>
            </div>
        </div>
    );

    return (
        <div className="p-4 max-w-md mx-auto">
            {/* Card PrimeReact avec le design exact de l'image */}
            <Card 
                header={header}
                footer={footer}
                className="shadow-2xl border-0 rounded-2xl overflow-hidden"
            >
                {/* Le contenu de la card peut être vide ou contenir des informations supplémentaires */}
                <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                        Votre engagement fait la différence
                    </p>
                </div>
            </Card>

            {/* Section supplémentaire avec des données statiques */}
            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card className="shadow-md border-0 rounded-xl">
                    <div className="text-center p-4">
                        <div className="text-2xl font-bold text-blue-600">150+</div>
                        <div className="text-gray-600 text-sm mt-1">Entreprises accompagnées</div>
                    </div>
                </Card>
                
                <Card className="shadow-md border-0 rounded-xl">
                    <div className="text-center p-4">
                        <div className="text-2xl font-bold text-purple-600">85%</div>
                        <div className="text-gray-600 text-sm mt-1">Taux de satisfaction</div>
                    </div>
                </Card>
                
                <Card className="shadow-md border-0 rounded-xl">
                    <div className="text-center p-4">
                        <div className="text-2xl font-bold text-green-600">2M€</div>
                        <div className="text-gray-600 text-sm mt-1">Paiements modulés</div>
                    </div>
                </Card>
            </div>

            {/* Boutons d'action */}
            <div className="mt-6 flex flex-col gap-3">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl border-0 shadow-lg transition-all duration-300 text-center">
                    S'engager maintenant
                </button>
                <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl border-0 shadow-lg transition-all duration-300 text-center">
                    Voir les témoignages
                </button>
            </div>
        </div>
    );
};

export default DeclarationActivites;