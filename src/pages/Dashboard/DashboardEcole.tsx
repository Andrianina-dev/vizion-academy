import React from 'react';
// import MissionTable from '../../components/MissionTable';
import Collaborateurs from '../../components/CollaborationList';
import FactureList from '../../components/FactureList';

const DashboardEcole: React.FC = () => {
//   const ecoleId = 'ECL-001'; // à remplacer par l'école connectée

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ✅ Tableau des missions */}
      <FactureList/>

      {/* ✅ Tableau des collaborations */}
      <Collaborateurs />
    </div>
  );
};

export default DashboardEcole;
