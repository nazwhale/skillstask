import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { skills } from '@/data/skills';
import { shortSkills } from '@/data/shortSkills';

// Helper: Base64 encode/decode (URL-safe)
function encodeBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const useWindowSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    React.useEffect(() => {
        const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return size;
};

const Quadrant = ({ title, subtitle, items, color, intensity = {} }) => {
    const ring = {
        green: 'ring-green-400',
        blue: 'ring-blue-400',
        amber: 'ring-amber-400',
        red: 'ring-red-400'
    }[color] || 'ring-gray-300';

    // Sort items by intensity (highest first)
    const sortedItems = [...items].sort((a, b) => {
        const aIntensity = intensity[a.name]?.total || 0;
        const bIntensity = intensity[b.name]?.total || 0;
        return bIntensity - aIntensity;
    });

    // Create a map of all skills for easy lookup
    const allSkills = [...skills, ...shortSkills];
    const skillMap = allSkills.reduce((acc, skill) => {
        acc[skill.name] = skill;
        return acc;
    }, {});

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
            className={`bg-white rounded-2xl shadow p-4 ring-4 ${ring}`}
        >
            <h2 className="text-lg font-bold text-center mb-1">{title}</h2>
            <p className="text-xs text-center text-gray-500 mb-2">{subtitle}</p>
            {sortedItems.length ? (
                <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
                    {sortedItems.map(({ name, emoji }) => {
                        const skillIntensity = intensity[name];
                        const totalIntensity = skillIntensity?.total || 0;
                        const normalizedIntensity = Math.round(totalIntensity / 2); // Normalize to 100%
                        const intensityColor = normalizedIntensity > 80 ? 'text-red-600' :
                            normalizedIntensity > 60 ? 'text-orange-600' :
                                normalizedIntensity > 40 ? 'text-yellow-600' :
                                    normalizedIntensity > 20 ? 'text-blue-600' : 'text-gray-500';

                        const skillDescription = skillMap[name]?.description || '';

                        return (
                            <li key={name} className="flex items-center justify-between">
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <span className="cursor-help">{emoji} {name}</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{skillDescription}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {normalizedIntensity > 0 && (
                                    <span className={`text-xs font-bold ${intensityColor}`}>
                                        {normalizedIntensity}%
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-xs italic text-center text-gray-400">(none chosen)</p>
            )}
        </motion.div>
    );
};

export default function SkillQuadrantsSummary({ summary, onRestart }) {
    const windowSize = useWindowSize();
    const [copied, setCopied] = useState(false);

    // Shareable link logic
    const getShareUrl = () => {
        if (!summary) return window.location.href;
        // Include both skill names and intensity data
        const data = JSON.stringify({
            superpowers: summary.superpowers,
            growth: summary.growth,
            burnout: summary.burnout,
            avoid: summary.avoid,
            intensity: summary.intensity || {}
        });
        const encoded = encodeBase64(data);
        const base = window.location.origin + window.location.pathname;
        return `${base}?data=${encoded}`;
    };

    const handleCopyLink = async () => {
        const url = getShareUrl();
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch {
            alert('Failed to copy link');
        }
    };

    const { width, height } = windowSize;

    return (
        <div className="min-h-screen relative flex flex-col items-center gap-8 p-6 bg-slate-50 overflow-hidden">
            {width > 0 && (
                <Confetti width={width} height={height} recycle={false} numberOfPieces={280} gravity={0.25} />
            )}
            <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120 }}
                className="text-4xl font-extrabold text-center"
            >
                Your Skill Quadrants
            </motion.h1>
            <motion.div
                className="grid grid-cols-2 gap-6 max-w-5xl w-full"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            >
                <Quadrant title="Superpowers" subtitle="Love & Good" items={summary.likeGood || []} color="green" intensity={summary.intensity || {}} />
                <Quadrant title="Growth Zone" subtitle="Love & Bad" items={summary.likeBad || []} color="blue" intensity={summary.intensity || {}} />
                <Quadrant title="Burnout Risk" subtitle="Hate & Good" items={summary.hateGood || []} color="red" intensity={summary.intensity || {}} />
                <Quadrant title="Delegate / Avoid" subtitle="Hate & Bad" items={summary.hateBad || []} color="amber" intensity={summary.intensity || {}} />
            </motion.div>
            <div className="flex flex-row items-center gap-3 mt-2">
                <Button onClick={handleCopyLink}>
                    {copied ? '✓ Link copied!' : '🔗 Copy Shareable Link'}
                </Button>
                <Button onClick={onRestart} variant="outline">
                    ↻ Do it again
                </Button>
            </div>
        </div>
    );
} 