import { useRef, useCallback } from 'react';
import { Toast } from 'primereact/toast';

export const useToast = () => {
  const toastRef = useRef<Toast>(null);

  const showSuccess = useCallback((message: string) => {
    toastRef.current?.show({
      severity: 'success',
      summary: 'Succès',
      detail: message,
      life: 3000,
    });
  }, []);

  const showError = useCallback((message: string) => {
    toastRef.current?.show({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 5000,
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    toastRef.current?.show({
      severity: 'info',
      summary: 'Information',
      detail: message,
      life: 3000,
    });
  }, []);

  const showWarn = useCallback((message: string) => {
    toastRef.current?.show({
      severity: 'warn',
      summary: 'Attention',
      detail: message,
      life: 4000,
    });
  }, []);

  return { 
    toastRef,
    showSuccess, 
    showError, 
    showInfo, 
    showWarn 
  };
};

export default useToast;
