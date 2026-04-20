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
      return 'bg-green-600 dark:bg-green-600';
    case 'modified':
      return 'bg-blue-600 dark:bg-blue-600';
    case 'deleted':
      return 'bg-red-600 dark:bg-red-600';
    case 'conflict':
      return 'bg-orange-500 dark:bg-orange-500';
    case 'normal':
    default:
      return 'bg-transparent';
  }
}
