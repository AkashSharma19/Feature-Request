import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const STATUS_CONFIG = {
  'Open':           { color: 'bg-slate-100 text-slate-700 border-slate-200',   dot: 'bg-slate-400' },
  'In Progress':    { color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-500' },
  'In Design':      { color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  'Under Review':   { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  'Development':    { color: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  'Testing':        { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  'Tested':         { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  'Closed':         { color: 'bg-green-50 text-green-700 border-green-200',    dot: 'bg-green-500' },
  'Cancelled':      { color: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-500' },
};

export const STATUS_PROGRESS = {
  'Open': 0,
  'In Progress': 10,
  'In Design': 25,
  'Under Review': 40,
  'Development': 60,
  'Testing': 80,
  'Tested': 90,
  'Closed': 100,
  'Cancelled': 0,
};

export const CATEGORIES = ['Bug', 'Feature Request', 'Data Needed', 'Term Report/ Transcript'];
export const STATUSES = ['Open', 'In Progress', 'In Design', 'Under Review', 'Development', 'Testing', 'Tested', 'Closed', 'Cancelled'];
export const ASSIGNEES = ['Unassigned', 'Anushka', 'Akash', 'Nikhil'];

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff/86400)}d ago`;
  return formatDate(dateStr);
}

export function getQuarterFromDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const month = date.getMonth();
  const year = date.getFullYear();
  let quarter = 'Q4';
  if (month <= 2) quarter = 'Q1';
  else if (month <= 5) quarter = 'Q2';
  else if (month <= 8) quarter = 'Q3';
  return { quarter, year };
}
