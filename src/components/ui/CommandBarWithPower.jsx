import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Helper to get power copy
function getPowerCopy(powerLevel, direction) {
    if (direction === 'left') {
        if (powerLevel < 34) return 'Meh';
        if (powerLevel < 67) return 'Nah';
        return 'Hell no!';
    } else {
        if (powerLevel < 34) return 'Meh';
        if (powerLevel < 67) return 'Yeah';
        return 'Yuuus!';
    }
}

/**
 * CommandBarWithPower
 * Combines the command bar (arrows, YES/NO) with a dynamic power bar that fills left or right.
 * Props:
 *   - isPressing: boolean
 *   - powerLevel: number (0-100)
 *   - direction: 'left' | 'right' | null
 *   - stage: 'round1' | 'round2'
 */
export default function CommandBarWithPower({
    isPressing = false,
    powerLevel = 0,
    direction = null,
    stage = 'round1',
}) {
    // Bar fill color and direction
    const fillColor =
        stage === 'round1'
            ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
            : 'bg-gradient-to-r from-green-400 via-green-500 to-green-600';

    // Power bar fill style
    const fillStyle = direction === 'left'
        ? { left: 0, right: '50%' }
        : direction === 'right'
            ? { right: 0, left: '50%' }
            : { left: 0, right: 0 };

    // Calculate width for fill
    const fillWidth = `${powerLevel}%`;
    const showFill = isPressing && direction;

    // Center text
    const centerText = isPressing && direction ? getPowerCopy(powerLevel, direction) : 'Hold for power';
    const centerTextColor = isPressing && direction ? 'text-gray-700 font-bold' : 'text-gray-400';

    return (
        <div className="w-full flex justify-center mt-2">
            <div className="rounded-lg border shadow bg-white/80 max-w-md w-full px-2 py-1 flex items-center relative overflow-hidden">
                {/* Left arrow/NO */}
                <div className="flex items-center gap-2 min-w-[70px]">
                    <ArrowLeft className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">NO</span>
                </div>
                {/* Center text or power copy */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    {/* Power bar fill (left) */}
                    {showFill && direction === 'left' && (
                        <motion.div
                            className={`absolute right-0 top-1/2 -translate-y-1/2 h-7 ${fillColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: fillWidth }}
                            transition={{ duration: 0.1, ease: 'easeOut' }}
                            style={{ zIndex: 0, borderRadius: '9999px 0 0 9999px' }}
                        />
                    )}
                    {/* Power bar fill (right) */}
                    {showFill && direction === 'right' && (
                        <motion.div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 h-7 ${fillColor}`}
                            initial={{ width: 0 }}
                            animate={{ width: fillWidth }}
                            transition={{ duration: 0.1, ease: 'easeOut' }}
                            style={{ zIndex: 0, borderRadius: '0 9999px 9999px 0' }}
                        />
                    )}
                    {/* Center text */}
                    <span className={`text-xs px-2 py-1 z-10 transition-colors duration-150 ${centerTextColor}`}>{centerText}</span>
                </div>
                {/* Right arrow/YES */}
                <div className="flex items-center gap-2 min-w-[70px] justify-end">
                    <span className="text-sm font-medium">YES</span>
                    <ArrowRight className="w-5 h-5 text-green-500" />
                </div>
            </div>
        </div>
    );
} 