'use client';

import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  className = '',
}: SwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center 
        rounded-full border-2 border-transparent transition-colors 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950
        disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? 'bg-indigo-600' : 'bg-slate-700'}
        ${className}
      `}
    >
      <motion.span
        aria-hidden="true"
        initial={false}
        animate={{
          x: checked ? 16 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full 
          shadow-lg ring-0 transition-colors
          ${checked ? 'bg-white' : 'bg-slate-400'}
        `}
      />
    </button>
  );
}
