import React from 'react';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import type { CustomButtonProps } from '../../../../types/forms';

const CustomButton: React.FC<CustomButtonProps & { style?: React.CSSProperties }> = ({
  label,
  onClick,
  loading = false,
  disabled = false,
  severity,
  icon,
  size = 'medium', // taille par défaut
  style
}) => {
  // Classes PrimeReact pour la taille
  const sizeClass =
    size === 'small' ? 'p-button-sm' :
    size === 'large' ? 'p-button-lg' :
    'p-button-md'; // taille moyenne par défaut

  return (
    <Button
      label={label}
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      severity={severity}
      icon={icon}
      className={classNames(sizeClass, 'custom-violet-button')} // largeur full retirée pour réduire le bouton
      style={{ ...style, minWidth: '120px' }} // largeur minimale pour que ce ne soit pas énorme
    />
  );
};

export default CustomButton;
