import React from 'react';

export function Card({ className, ...props }) {
    return (
        <div
            className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className || ''}`}
            {...props}
        />
    );
}

export function CardContent({ className, padding = 'p-6', ...props }) {
    return (
        <div className={`${padding} ${className || ''}`} {...props} />
    );
} 