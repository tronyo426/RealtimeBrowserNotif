import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SQCDPData {
  category: 'SAFETY' | 'QUALITY' | 'COST' | 'DELIVERY' | 'PEOPLE';
  score: number; // 0-100
  label: string;
  trend: 'up' | 'down' | 'stable';
  stats: {
    label: string;
    value: string | number;
  }[];
}

export const INITIAL_DATA: SQCDPData[] = [
  {
    category: 'SAFETY',
    score: 85,
    label: 'S',
    trend: 'stable',
    stats: [
      { label: 'Incident', value: 4 },
      { label: 'No Incident', value: 12 },
      { label: 'Days without Injuries', value: 14 }
    ]
  },
  {
    category: 'QUALITY',
    score: 92,
    label: 'Q',
    trend: 'up',
    stats: [
      { label: '< 60%', value: 7 },
      { label: '> 90%', value: 9 },
      { label: 'Product Defect Rate', value: '20%' }
    ]
  },
  {
    category: 'COST',
    score: 65,
    label: 'C',
    trend: 'down',
    stats: [
      { label: 'Over Budget', value: 3 },
      { label: 'Budget Adherence', value: 13 },
      { label: 'Projected Variance', value: '5%' }
    ]
  },
  {
    category: 'DELIVERY',
    score: 84,
    label: 'D',
    trend: 'stable',
    stats: [
      { label: 'Delayed Dispatch', value: 5 },
      { label: 'In Time Dispatch', value: 11 },
      { label: 'On-Time Delivery Rate', value: '84%' }
    ]
  },
  {
    category: 'PEOPLE',
    score: 78,
    label: 'P',
    trend: 'up',
    stats: [
      { label: 'Training Overdue', value: 4 },
      { label: 'Training Complete', value: 12 },
      { label: 'Training & Development Hours', value: '6hr' }
    ]
  }
];
