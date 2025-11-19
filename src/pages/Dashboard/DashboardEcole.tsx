import React from 'react';
import { Link } from 'react-router-dom';
// import MissionTable from '../../components/MissionTable';
import Collaborateurs from '../../components/CollaborationList';
import FactureList from '../../components/FactureList';

const DashboardEcole: React.FC = () => {
  //   const ecoleId = 'ECL-001'; // à remplacer par l'école connectée

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Espace École</h2>
        <Link to="/ecole/ajouter" className="text-blue-700 hover:underline">
          Ajoutez votre école
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ✅ Tableau des missions */}
        <FactureList />

        {/* ✅ Tableau des collaborations */}
        <Collaborateurs />
      </div>
    </div>
  );
};

export default DashboardEcole;
