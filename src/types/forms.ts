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
}

export interface CustomButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  severity?: 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'help';
  icon?: string;
  size?: 'small' | 'large';
}

export interface LoginFormData {
  email: string;
  password: string;
}