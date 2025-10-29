import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';

const DashboardIntervenant: React.FC = () => {
  // Données statiques (mock)
  const factures = [
    { id: 'FAC-2025-001', statut: 'payee', montant: 420, date: '2025-10-01' },
    { id: 'FAC-2025-002', statut: 'en attente', montant: 260, date: '2025-10-07' },
    { id: 'FAC-2025-003', statut: 'en validation', montant: 320, date: '2025-10-15' },
  ];

  const paiementsEnAttente = [
    { virement: 'VIR-8841', dateEstimee: '2025-11-05', motif: '-', montant: 260 },
    { virement: 'VIR-8842', dateEstimee: '2025-11-12', motif: 'Validation facture', montant: 320 },
  ];

  const missionsRealisees = [
    { ecole: 'Lycée Lumière', date: '2025-10-03', tauxHoraire: 40, heures: 6, intitule: 'Atelier IA' },
    { ecole: 'Collège Victor Hugo', date: '2025-10-10', tauxHoraire: 45, heures: 4, intitule: 'Robotique' },
  ];

  const [profil, setProfil] = useState({
    photoUrl: '',
    bio: 'Intervenant passionné par les STEM et la pédagogie active.',
    competences: 'IA, Robotique, Arduino',
    disponibilite: 'Hebdomadaire',
    documents: 'CV.pdf, Diplôme.pdf'
  });

  const statutTemplate = (statut: string) => {
    const map: Record<string, { label: string; severity: 'success' | 'warning' | 'info' }> = {
      'payee': { label: 'Payée', severity: 'success' },
      'en attente': { label: 'En attente', severity: 'warning' },
      'en validation': { label: 'En validation', severity: 'info' },
    };
    const s = map[statut] || { label: statut, severity: 'info' };
    return <Tag value={s.label} severity={s.severity} />;
  };

  return (
    <div className="p-4 md:p-5 space-y-4">
      <h2 className="text-2xl font-semibold">Tableau de bord Intervenant</h2>

      {/* Factures */}
      <Card title="Factures générées automatiquement" subTitle="Téléchargeables en PDF" className="shadow-sm">
        <div className="grid">
          {factures.map((f) => (
            <div key={f.id} className="col-12 md:col-4">
              <div className="p-3 border-round surface-50 flex justify-content-between align-items-center">
                <div>
                  <div className="text-sm font-semibold">{f.id}</div>
                  <div className="text-sm">Montant: {f.montant} €</div>
                  <div className="text-sm">Date: {f.date}</div>
                  <div className="mt-2">{statutTemplate(f.statut)}</div>
                </div>
                <Button icon="pi pi-download" label="PDF" className="p-button-text" onClick={() => alert(`Téléchargement ${f.id}.pdf (mock)`)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Paiements en attente */}
      <Card title="Paiements en attente" subTitle="Liste des virements prévus" className="shadow-sm">
        <div className="grid">
          {paiementsEnAttente.map((p) => (
            <div key={p.virement} className="col-12 md:col-6">
              <div className="p-3 border-round surface-50">
                <div className="flex justify-content-between">
                  <span className="font-medium">{p.virement}</span>
                  <span className="font-medium">{p.montant} €</span>
                </div>
                <div className="text-sm mt-2">Date estimée: {p.dateEstimee}</div>
                <div className="text-sm">Motif: {p.motif}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Missions réalisées */}
      <Card title="Missions réalisées (récapitulatif)" className="shadow-sm">
        <div className="grid">
          {missionsRealisees.map((m, idx) => (
            <div key={idx} className="col-12">
              <div className="p-3 border-round surface-50 flex flex-wrap gap-3 align-items-center">
                <div className="font-medium">{m.intitule}</div>
                <div className="text-sm">École: {m.ecole}</div>
                <div className="text-sm">Date: {m.date}</div>
                <div className="text-sm">Taux horaire: {m.tauxHoraire} €/h</div>
                <div className="text-sm">Heures: {m.heures} h</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Déclaration d’activité (formulaire placeholder) */}
      <Card title="Déclaration d’activité" subTitle="Style URSSAF (placeholder)" className="shadow-sm">
        <div className="grid formgrid p-fluid">
          <div className="field col-12 md:col-6">
            <label htmlFor="periode">Période</label>
            <Dropdown id="periode" value={"Octobre 2025"} options={["Septembre 2025", "Octobre 2025", "Novembre 2025"]} onChange={() => {}} />
          </div>
          <div className="field col-12 md:col-3">
            <label htmlFor="heures">Nombre d'heures</label>
            <InputText id="heures" value={"10"} onChange={() => {}} />
          </div>
          <div className="field col-12 md:col-3">
            <label htmlFor="taux">Taux horaire (€)</label>
            <InputText id="taux" value={"40"} onChange={() => {}} />
          </div>
          <div className="field col-12">
            <label htmlFor="commentaire">Commentaire</label>
            <InputTextarea id="commentaire" rows={3} value={"Déclaration d'activité (exemple)"} onChange={() => {}} />
          </div>
          <div className="col-12">
            <Button label="Soumettre la déclaration" icon="pi pi-send" onClick={() => alert('Déclaration envoyée (mock)')} />
          </div>
        </div>
      </Card>

      {/* Profil public (édition simple) */}
      <Card title="Profil public" subTitle="Mise à jour par l'intervenant" className="shadow-sm">
        <div className="grid formgrid p-fluid">
          <div className="field col-12 md:col-6">
            <label htmlFor="photo">Photo (URL)</label>
            <InputText id="photo" value={profil.photoUrl} onChange={(e) => setProfil({ ...profil, photoUrl: e.target.value })} />
          </div>
          <div className="field col-12">
            <label htmlFor="bio">Bio</label>
            <InputTextarea id="bio" rows={3} value={profil.bio} onChange={(e) => setProfil({ ...profil, bio: e.target.value })} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="competences">Compétences</label>
            <InputText id="competences" value={profil.competences} onChange={(e) => setProfil({ ...profil, competences: e.target.value })} />
          </div>
          <div className="field col-12 md:col-6">
            <label htmlFor="dispo">Disponibilité</label>
            <InputText id="dispo" value={profil.disponibilite} onChange={(e) => setProfil({ ...profil, disponibilite: e.target.value })} />
          </div>
          <div className="field col-12">
            <label htmlFor="docs">Documents</label>
            <InputText id="docs" value={profil.documents} onChange={(e) => setProfil({ ...profil, documents: e.target.value })} />
          </div>
          <div className="col-12">
            <Button label="Enregistrer" icon="pi pi-save" onClick={() => alert('Profil enregistré (mock)')} />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card title="Notifications" subTitle="Automatiques" className="shadow-sm">
        <ul className="m-0 p-0 list-none space-y-2">
          <li className="p-2 border-round surface-50 flex align-items-center gap-2"><i className="pi pi-file-pdf text-primary" /> Facture générée FAC-2025-003</li>
          <li className="p-2 border-round surface-50 flex align-items-center gap-2"><i className="pi pi-check-circle text-green-500" /> Paiement validé VIR-8840</li>
          <li className="p-2 border-round surface-50 flex align-items-center gap-2"><i className="pi pi-user-edit text-yellow-500" /> Profil accepté</li>
          <li className="p-2 border-round surface-50 flex align-items-center gap-2"><i className="pi pi-briefcase text-blue-500" /> Mission confirmée: Atelier IA</li>
        </ul>
      </Card>
    </div>
  );
};

export default DashboardIntervenant;
