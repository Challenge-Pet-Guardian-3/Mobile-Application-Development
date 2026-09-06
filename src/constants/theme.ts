/**
 * PetGuardian Design System - Theme Tokens
 * Centraliza a paleta de cores harmoniosa, espaçamentos, raios de borda e medidas modais.
 */

export const colors = {
  // Cores Primárias de Ação e Destaque
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    default: '#2563EB',
  },

  // Sucesso, Conclusão de Tarefas e Saúde Positiva
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    default: '#10B981',
  },

  // Perigo, Alerta e Ações Destrutivas
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    default: '#EF4444',
  },

  // Avisos, Pontos XP e Destaques Amarelos/Laranja
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    default: '#D97706',
  },

  // Tons Neutros e Superfícies (Slate)
  neutral: {
    white: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Overlays translúcidos
  overlay: {
    dark: 'rgba(15, 23, 42, 0.65)',
    light: 'rgba(255, 255, 255, 0.85)',
  },

  // Trilha Duolingo & Aulas Educativas
  gamification: {
    green: '#58CC02',
    gold: '#FF9600',
    blue: '#0066FF',
    purple: '#7C3AED',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const layout = {
  modal: {
    width: {
      sm: 360,
      md: 440,
      lg: 520,
    },
    maxHeightRatio: 0.7,
    maxHeightMaxPx: 540,
    cardPadding: 22,
  },
  screenPadding: 20,
  headerHeight: 60,
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  layout,
} as const;

export default theme;
