import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
    error?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
    ({ label, icon, error, className = '', ...props }, ref) => {
        return (
            <div className="space-y-2">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-1">
                    {label}
                </label>
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors duration-300">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full bg-surface-elevated/50 border border-white/5 rounded-xl 
              ${icon ? 'pl-12 pr-4' : 'px-4'} py-4 
              outline-none text-white placeholder:text-text-muted/30 font-medium
              focus:border-primary/50 focus:bg-surface-elevated focus:ring-1 focus:ring-primary/50 
              transition-all duration-300
              ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}
              ${className}
            `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500 ml-1 animate-slide-up">{error}</p>
                )}
            </div>
        );
    }
);
AuthInput.displayName = 'AuthInput';


interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    children: React.ReactNode;
}

export const SubmitButton = ({ isLoading, children, className = '', ...props }: SubmitButtonProps) => {
    return (
        <button
            type="submit"
            disabled={isLoading || props.disabled}
            className={`
        relative w-full overflow-hidden
        bg-gradient-to-r from-primary to-primary-dark 
        hover:brightness-110 text-black font-bold 
        h-14 rounded-xl flex items-center justify-center gap-2 
        transition-all duration-300 
        disabled:opacity-70 disabled:cursor-not-allowed 
        shadow-[0_0_20px_-10px_rgba(245,166,35,0.4)] 
        hover:shadow-[0_0_30px_-5px_rgba(245,166,35,0.6)] 
        hover:-translate-y-0.5 active:scale-[0.98]
        ${className}
      `}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                children
            )}
        </button>
    );
};
