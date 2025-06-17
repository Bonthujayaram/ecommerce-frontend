import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={`h-10 px-3 py-2 text-sm w-full pr-10 ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 focus:outline-none"
        >
          {show ? <EyeOff size={20} color="#fff" /> : <Eye size={20} color="#fff" />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput'; 