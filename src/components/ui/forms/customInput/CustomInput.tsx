// components/ui/forms/customInput/CustomInput.tsx
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';

interface CustomInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  error?: string;
  icon?: string;
  className?: string;
  inputStyle?: React.CSSProperties;
  size?: 'small' | 'medium' | 'large';
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  icon,
  className = '',
  inputStyle,
  size = 'medium'
}) => {
  const commonProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    placeholder,
    className: `w-full ${className}`,
  };

  const sizeClass = size === 'large' ? 'p-3 text-lg' : size === 'small' ? 'p-2 text-sm' : 'p-2';
  const inputClassName = `w-full ${sizeClass} border-round surface-border`;
  const inputStyles = { 
    width: '100%', 
    padding: '0.75rem'
  };

  const renderInput = () => {
    if (type === 'password') {
      return (
        <Password
          {...commonProps}
          className={`w-full bg-white border-1 surface-border border-round overflow-hidden ${className}`}
          toggleMask
          feedback={false}
          inputStyle={{ ...inputStyles, ...inputStyle }}
          inputClassName={`w-full bg-transparent border-none ${sizeClass}`}
          pt={{
            root: { className: 'w-full' },
            input: { 
              className: `w-full bg-transparent border-none ${sizeClass}`,
              style: { width: '100%' }
            },
            panel: { className: 'w-full' }
          }}
        />
      );
    }

    // Pour les inputs avec icône
    if (icon) {
      return (
        <IconField className="w-full">
          <InputIcon className={icon} />
          <InputText
            {...commonProps}
            type={type}
            className={inputClassName}
            style={inputStyles}
            pt={{
              root: { 
                className: inputClassName,
                style: inputStyles
              }
            }}
          />
        </IconField>
      );
    }

    // Pour les inputs sans icône (email, text, etc.)
    return (
      <InputText
        {...commonProps}
        type={type}
        className={inputClassName}
        style={inputStyles}
        pt={{
          root: { 
            className: inputClassName,
            style: inputStyles
          }
        }}
      />
    );
  };

  return (
    <div className="field w-full">
      {label && (
        <label className="block text-900 font-medium mb-2">
          {label}
        </label>
      )}
      <div className="w-full">
        {renderInput()}
      </div>
      {error && (
        <small className="text-red-500 text-sm mt-1 block">
          {error}
        </small>
      )}
    </div>
  );
};

export default CustomInput;