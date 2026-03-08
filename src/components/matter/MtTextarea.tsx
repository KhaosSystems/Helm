import { TextareaHTMLAttributes } from 'react';

interface MtTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'ghost';
}

export const MtTextarea = ({ variant = 'default', className, ...props }: MtTextareaProps) => {
  const surfaceClasses = {
    default: 'mt-surface-input-default',
    ghost: 'mt-surface-input-ghost',
  };

  const baseClasses = 'w-full border rounded outline-none px-3 py-2 min-h-24 resize-y';

  return <textarea {...props} className={`${baseClasses} ${surfaceClasses[variant]} ${className || ''}`} />;
};
