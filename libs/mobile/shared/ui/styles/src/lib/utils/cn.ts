import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

type AdditionalTextGroupIDs = 'text-size' | 'text-color' | 'icon-color';

const customTwMerge = extendTailwindMerge<AdditionalTextGroupIDs>({
  extend: {
    conflictingClassGroupModifiers: {
      'text-size': ['text-color'],
    },
    classGroups: {
      'text-size': [
        'text-h1',
        'text-h1-sm',
        'text-h2',
        'text-h2-sm',
        'text-h3',
        'text-h3-sm',
        'text-h4',
        'text-h4-sm',
        'text-h5',
        'text-h5-sm',
        'text-lg',
        'text-lg-sm',
        'text-md',
        'text-md-sm',
        'text-sm',
        'text-sm-sm',
        'text-xs',
        'text-xs-sm',
      ],
      'text-color': [
        'text-primary',
        'text-secondary',
        'text-tertiary',
        'text-status-error',
        'text-status-warning',
        'text-status-success',
        'text-brand-primary',
        'text-brand-secondary',
      ],
      'bg-color': [
        'bg-background-primary',
        'bg-background-secondary',
        'bg-background-tertiary',
        'bg-background-quaternary',
        'bg-background-primary-transparent',
        'bg-background-elevated-surface',
        'bg-background-elevated-surface-shadow',
        'bg-transparent',
        'bg-status-danger',
        'bg-status-danger-light',
        'bg-status-success',
        'bg-status-warning',
        'bg-status-success-light',
        'bg-status-warning-light',
        'bg-status-warning-orange',
        'bg-status-warning-orange-light',
        'bg-text-foreground',
      ],
      'border-color': ['border-background-tertiary'],
      'icon-color': [
        'color-text-primary',
        'color-text-secondary',
        'color-text-tertiary',
        'color-text-foreground',
        'color-brand-primary',
        'color-brand-secondary',
        'color-background-primary',
        'color-background-secondary',
        'color-background-tertiary',
        'color-status-danger',
        'color-status-success',
        'color-status-warning',
        'color-status-success-light',
        'color-status-warning-light',
        'color-status-warning-orange',
        'color-status-warning-orange-light',
      ],
      px: ['px-content-offset'],
      pt: ['pt-content-offset'],
      mt: ['mt-safe'],
    },
  },
});

export function cn(...inputs: Array<ClassValue>): string {
  return customTwMerge(clsx(inputs));
}
