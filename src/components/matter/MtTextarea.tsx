import { TextareaHTMLAttributes, useLayoutEffect, useRef } from 'react';

interface MtTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'ghost';
  autoSize?: boolean;
}

export const MtTextarea = ({ variant = 'default', autoSize = false, className, onInput, value, defaultValue, ...props }: MtTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const surfaceClasses = {
    default: 'mt-surface-input-default',
    ghost: 'mt-surface-input-ghost',
  };

  const baseClasses = `w-full border rounded outline-none px-3 py-2 ${autoSize ? 'min-h-0 resize-none overflow-hidden' : 'min-h-24 resize-y'}`;

  const resize = () => {
    const textarea = textareaRef.current;

    if (!textarea || !autoSize) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useLayoutEffect(() => {
    resize();
  }, [autoSize, value, defaultValue]);

  return (
    <textarea
      ref={textareaRef}
      {...props}
      value={value}
      defaultValue={defaultValue}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      className={`${baseClasses} ${surfaceClasses[variant]} ${className || ''}`}
    />
  );
};
