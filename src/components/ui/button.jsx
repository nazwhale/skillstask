import React from 'react';

export function Button({ className, children, variant, ...props }) {
    let base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4';
    let styles = '';
    if (variant === 'outline') {
        styles = 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700';
    } else {
        styles = 'bg-blue-600 text-white hover:bg-blue-700';
    }
    return (
        <button
            className={`${base} ${styles} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
} 