import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import './PageHeader.css';

interface BreadcrumbItem {
  title: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, breadcrumb = [] }) => {
  return (
    <div className="page-header">
      {breadcrumb.length > 0 && (
        <Breadcrumb className="mb-4">
          {breadcrumb.map((item, index) => (
            <Breadcrumb.Item key={index}>
              {item.path ? <Link to={item.path}>{item.title}</Link> : item.title}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
};

export default PageHeader;
