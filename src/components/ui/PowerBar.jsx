import React from 'react';
import { motion } from 'framer-motion';

function getPowerCopy(powerLevel) {
    if (powerLevel < 34) return 'Meh';
    if (powerLevel < 67) return 'Yeah';
    return 'Yuuus!';
}

export function PowerBar({ powerLevel = 0, isVisible = false }) {
    const copy = getPowerCopy(powerLevel);
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: isVisible ? 1 : 0,
                scale: isVisible ? 1 : 0.8
            }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-20"
        >
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-600">POWER</span>
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            key={isVisible ? 'visible' : 'hidden'}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${powerLevel}%` }}
                            transition={{ duration: 0.1, ease: 'easeOut' }}
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-700 w-8 text-right">
                        {Math.round(powerLevel)}%
                    </span>
                    <span className="text-xs font-semibold text-gray-700 min-w-[40px] text-center">
                        {copy}
                    </span>
                </div>
            </div>
        </motion.div>
    );
} 