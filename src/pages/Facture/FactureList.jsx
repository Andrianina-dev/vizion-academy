import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { getFacturesParEcole } from "../services/factureService";

export default function FactureList({ ecoleId }) {
  const [factures, setFactures] = useState([]);

  useEffect(() => {
    async function fetchFactures() {
      const data = await getFacturesParEcole(ecoleId);
      setFactures(data);
    }
    fetchFactures();
  }, [ecoleId]);

  const dateTemplate = (rowData) => {
    const date = new Date(rowData.date_creation);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="card">
      <h3>Factures de l’école {ecoleId}</h3>
      <DataTable value={factures} paginator rows={5} responsiveLayout="scroll">
        <Column field="id" header="ID Facture"></Column>
        <Column field="montant" header="Montant (€)"></Column>
        <Column field="mission.nom" header="Mission"></Column>
        <Column field="intervenant.nom" header="Intervenant"></Column>
        <Column field="date_creation" header="Date" body={dateTemplate}></Column>
        <Column field="date_paiement" header="Date" body={dateTemplate}></Column>
      </DataTable>
    </div>
  );
}
