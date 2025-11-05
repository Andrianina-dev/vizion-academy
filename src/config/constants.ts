// Configuration des constantes de l'application
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const APP_NAME = 'Vizion Academy';

export const SUPPORT_EMAIL = 'support@vizionacademy.com';
export const SUPPORT_PHONE = '+33 1 23 45 67 89';

// Durées en millisecondes
export const TOAST_DURATION = 5000;
export const AUTO_LOGOUT_DELAY = 30 * 60 * 1000; // 30 minutes

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATE_TIME_FORMAT = 'dd/MM/yyyy HH:mm';

// Rôles utilisateur
export const ROLES = {
  ADMIN: 'admin',
  SCHOOL: 'ecole',
  INTERVENANT: 'intervenant',
} as const;

// Statuts des tickets de support
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
} as const;

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;
