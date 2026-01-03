import React, { forwardRef } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, icon, fullWidth = false, className = '', ...props }, ref) => {
        return (
            <div className={`input-wrapper ${fullWidth ? 'input-full' : ''} ${className}`}>
                {label && <label className="input-label">{label}</label>}
                <div className={`input-container ${error ? 'input-error' : ''}`}>
                    {icon && <span className="input-icon">{icon}</span>}
                    <input ref={ref} className="input-field" {...props} />
                </div>
                {error && <span className="input-error-text">{error}</span>}
                {helperText && !error && <span className="input-helper">{helperText}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
        return (
            <div className={`input-wrapper ${fullWidth ? 'input-full' : ''} ${className}`}>
                {label && <label className="input-label">{label}</label>}
                <textarea
                    ref={ref}
                    className={`textarea-field ${error ? 'input-error' : ''}`}
                    {...props}
                />
                {error && <span className="input-error-text">{error}</span>}
                {helperText && !error && <span className="input-helper">{helperText}</span>}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
