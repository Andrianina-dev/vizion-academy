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
  inputStyle
}) => {
  const commonProps = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    placeholder,
    className: `w-full ${className}`,
  };

  const inputClassName = "p-3 text-lg border-round surface-border";
  const inputStyles = { 
    width: '100%', 
    padding: '0.75rem'
  };

  const renderInput = () => {
    if (type === 'password') {
      return (
        <Password
          {...commonProps}
          toggleMask
          feedback={false}
          inputStyle={{ ...inputStyles, ...inputStyle }}
          inputClassName={inputClassName}
          pt={{
            root: { className: 'w-full' },
            input: { 
              className: inputClassName,
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