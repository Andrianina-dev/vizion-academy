import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import type { Paiement } from '../../../services/paiementService';

interface PaiementListProps {
  paiements: Paiement[];
  loading: boolean;
  showStatus?: boolean;
  showActions?: boolean;
}

export const PaiementList: React.FC<PaiementListProps> = ({
  paiements,
  loading,
  showStatus = false,
  showActions = false,
}) => {
  const columns: ColumnsType<Paiement> = [
    {
      title: 'Référence',
      dataIndex: 'virement',
      key: 'virement',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Mission',
      key: 'mission',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.mission?.intitule || 'Non spécifié'}</div>
          <div className="text-xs text-gray-500">{record.mission?.ecole}</div>
        </div>
      ),
    },
    {
      title: 'Montant',
      key: 'montant',
      render: (_, record) => (
        <span className="font-medium">
          {record.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Date estimée',
      dataIndex: 'date_estimee',
      key: 'date_estimee',
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : 'Non spécifiée',
    },
  ];

  if (showStatus) {
    columns.splice(3, 0, {
      title: 'Statut',
      key: 'statut',
      render: (_, record) => {
        let color = 'default';
        let text = record.statut;
        
        switch (record.statut) {
          case 'validé':
            color = 'success';
            break;
          case 'en attente':
            color = 'warning';
            text = 'en attente';
            break;
          case 'en validation':
            color = 'processing';
            text = 'en validation';
            break;
          case 'bloqué':
            color = 'error';
            text = 'bloqué';
            break;
          default:
            color = 'default';
        }
        
        return (
          <div>
            <Tag color={color} className="mr-2">
              {text}
            </Tag>
            {record.motifBlocage && (
              <Tooltip title={record.motifBlocage}>
                <InfoCircleOutlined className="text-gray-400" />
              </Tooltip>
            )}
          </div>
        );
      },
    });
  }

  if (showActions) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Télécharger la facture">
            <Button 
              icon={<DownloadOutlined />} 
              onClick={() => {
                // TODO: Implémenter le téléchargement de la facture
                console.log('Télécharger la facture', record.id_facture);
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    });
  }

  // Si pas de paiements, afficher un message
  if (paiements.length === 0 && !loading) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>Aucun paiement trouvé</p>
      </div>
    );
  }

  // Grouper par statut si demandé
  const expandedRowRender = (paiement: Paiement) => {
    if (!paiement.mission) return null;
    
    return (
      <div className="p-4 bg-gray-50 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">École</div>
            <div>{paiement.mission.ecole}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Date de la mission</div>
            <div>{dayjs(paiement.mission.date).format('DD/MM/YYYY')}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Taux horaire</div>
            <div>{paiement.mission.taux_horaire?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}/h</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Heures effectuées</div>
            <div>{paiement.mission.heures} h</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Total</div>
            <div className="font-medium">
              {paiement.mission.total?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
        </div>
        
        {paiement.motifBlocage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-red-700">
            <div className="font-medium">Motif de blocage :</div>
            <div>{paiement.motifBlocage}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Table
      columns={columns}
      dataSource={paiements}
      rowKey="id_facture"
      loading={loading}
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => !!record.mission,
      }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `${total} paiements`,
      }}
    />
  );
};
