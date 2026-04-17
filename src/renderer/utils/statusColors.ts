import type { FileNode } from '@/shared/types';

export function getStatusColorClass(status: FileNode['status']): string {
  switch (status) {
    case 'new':
      return 'text-green-600 dark:text-green-400';
    case 'modified':
      return 'text-blue-600 dark:text-blue-400';
    case 'deleted':
      return 'text-red-600 dark:text-red-400';
    case 'conflict':
      return 'text-orange-600 dark:text-orange-400';
    case 'normal':
    default:
      return 'text-gray-900 dark:text-gray-100';
  }
}

export function getStatusBgClass(status: FileNode['status']): string {
  switch (status) {
    case 'new':
      return 'bg-green-50 dark:bg-green-900/20';
    case 'modified':
      return 'bg-blue-50 dark:bg-blue-900/20';
    case 'deleted':
      return 'bg-red-50 dark:bg-red-900/20';
    case 'conflict':
      return 'bg-orange-50 dark:bg-orange-900/20';
    case 'normal':
    default:
      return 'bg-transparent';
  }
}
