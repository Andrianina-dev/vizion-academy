import React from 'react';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface CustomInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  severity?: 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'help';
  icon?: string;
  iconPos?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

export interface LoginFormData {
  email: string;
  password: string;
}