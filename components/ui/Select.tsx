import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, className = '', ...props }) => {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>}
      <div className="relative">
        <select 
          className={`block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2 pl-3 pr-8 border bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:focus:border-emerald-400 dark:focus:ring-emerald-400 ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    </div>
  );
};