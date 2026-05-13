import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { AlertTriangle } from 'lucide-react';

export function Badge({ children, className, variant = 'default' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const cfg = {
    'Open':           'bg-slate-100 text-slate-700 border-slate-200',
    'In Progress':    'bg-blue-50 text-blue-700 border-blue-200',
    'In Design':      'bg-purple-50 text-purple-700 border-purple-200',
    'Under Review':   'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Development':    'bg-orange-50 text-orange-700 border-orange-200',
    'Testing':        'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Tested':         'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Closed':         'bg-green-50 text-green-700 border-green-200',
    'Cancelled':      'bg-red-50 text-red-700 border-red-200',
  };
  const dots = {
    'Open': 'bg-slate-400', 'In Progress': 'bg-blue-500', 'In Design': 'bg-purple-500',
    'Under Review': 'bg-indigo-500', 'Development': 'bg-orange-500', 'Testing': 'bg-yellow-500',
    'Tested': 'bg-emerald-500', 'Closed': 'bg-green-500', 'Cancelled': 'bg-red-500',
  };
  return (
    <Badge className={cfg[status] || cfg.Open}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dots[status] || dots.Open)} />
      {status}
    </Badge>
  );
}



export function ProgressBar({ value = 0, className }) {
  return (
    <div className={cn('progress-bar', className)}>
      <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const variants = {
    primary: 'bg-brand-900 text-white hover:bg-black shadow-sm active:scale-[0.98]',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-gray-900 text-gray-900 hover:bg-gray-50',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all placeholder:text-gray-400',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all placeholder:text-gray-400 resize-none',
        className
      )}
      {...props}
    />
  );
}

export function Select({ children, className, ...props }) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all appearance-none cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Modal({ open, onClose, children, title, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-5xl' };
  return createPortal(
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn('bg-white rounded-2xl shadow-2xl w-full overflow-hidden modal-content', sizes[size])}>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function Spinner({ size = 20 }) {
  return (
    <svg
      className="animate-spin text-gray-900"
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
export function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-gray-900" : "bg-gray-200"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-100", className)}
      {...props}
    />
  );
}

export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmText = 'Delete', variant = 'danger' }) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4",
          variant === 'danger' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
        )}>
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button 
            variant={variant} 
            onClick={() => { onConfirm(); onClose(); }} 
            className="flex-1 justify-center px-6"
          >
            {confirmText || 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export { default as RichTextEditor } from './RichTextEditor';
