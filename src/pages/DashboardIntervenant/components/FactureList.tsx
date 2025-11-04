import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

import type { Facture } from '../../../services/factureService';

interface FactureListProps {
  factures: Facture[];
  loading: boolean;
  onDownload: (factureId: string) => void;
  showActions?: boolean;
}

export const FactureList: React.FC<FactureListProps> = ({
  factures,
  loading,
  onDownload,
  showActions = false,
}) => {
  const columns: ColumnsType<Facture> = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: (text, record) => (
        <span className="font-medium">{text || record.id_facture}</span>
      ),
    },
    {
      title: 'Mission',
      dataIndex: 'titre_mission',
      key: 'mission',
      render: (text) => text || 'Non spécifiée',
    },
    {
      title: 'Montant',
      dataIndex: 'montant',
      key: 'montant',
      render: (montant) => (
        <span className="font-medium">
          {montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </span>
      ),
    },
    {
      title: 'Date de création',
      dataIndex: 'date_creation',
      key: 'date_creation',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => {
        let color = 'default';
        switch (statut) {
          case 'payée':
            color = 'success';
            break;
          case 'en attente':
            color = 'warning';
            break;
          case 'en validation':
            color = 'processing';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{statut}</Tag>;
      },
    },
  ];

  if (showActions) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Télécharger">
            <Button 
              icon={<DownloadOutlined />} 
              onClick={() => onDownload(record.id_facture)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Aperçu">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => {
                // TODO: Implémenter l'aperçu de la facture
                console.log('Aperçu de la facture', record.id_facture);
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={factures}
      rowKey="id_facture"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `${total} factures`,
      }}
    />
  );
};
