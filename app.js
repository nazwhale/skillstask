import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/*****************************************************************
 * Skill Sorter App – Severance-inspired mini-game
 * ---------------------------------------------------------------
 * ✓ Two-round sorting (Enjoy? → Good?)
 * ✓ Progress bars & swipe feedback
 * ✓ Confetti + colour-ring quadrants at the end
 *****************************************************************/

/* -------------------------- Skill list -------------------------- */
const tasks = [
    { name: 'Connector', description: 'Be the bridge between people or groups.' },
    { name: 'Quick Switcher', description: 'Adapt fast when things change.' },
    { name: 'Deep Diver', description: 'Break down complex problems logically.' },
    { name: 'Budget Boss', description: 'Stretch money or resources wisely.' },
    { name: 'Info Sorter', description: 'Group or organize people, things, or data.' },
    { name: 'Data Wrangler', description: 'Crunch and interpret numbers.' },
    { name: 'Detail Defender', description: 'Spot errors and keep things precise.' }
];

/* ---------------------------- Helpers --------------------------- */
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const useWindowSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return size;
};

/* ----------------------- Tiny components ------------------------ */
const ProgressBar = ({ label, percent, active }) => (
    <div className="w-32">
        <p className="text-[10px] text-center mb-0.5 font-medium tracking-wide">{label}</p>
        <div className="w-full h-2 rounded bg-gray-300 overflow-hidden">
            <div
                style={{ width: `${percent}%` }}
                className={`h-full transition-all duration-300 ${active ? 'bg-blue-500' : 'bg-blue-400/40'}`}
            />
        </div>
    </div>
);

const Quadrant = ({ title, subtitle, items, color }) => {
    const ring = {
        green: 'ring-green-400',
        blue: 'ring-blue-400',
        amber: 'ring-amber-400',
        red: 'ring-red-400'
    }[color] || 'ring-gray-300';

    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
            className={`bg-white rounded-2xl shadow p-4 ring-4 ${ring}`}
        >
            <h2 className="text-lg font-bold text-center mb-1">{title}</h2>
            <p className="text-xs text-center text-gray-500 mb-2">{subtitle}</p>
            {items.length ? (
                <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
                    {items.map(({ name }) => (
                        <li key={name}>{name}</li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs italic text-center text-gray-400">(none chosen)</p>
            )}
        </motion.div>
    );
};

/* -------------------------- Main app --------------------------- */
export default function SkillSorter() {
    const [stage, setStage] = useState('round1');
    const [index, setIndex] = useState(0);
    const [likeMap, setLike] = useState({});
    const [goodMap, setGood] = useState({});
    const [deck, setDeck] = useState(() => shuffle(tasks));
    const [decision, setDecision] = useState(null); // null | 'yes' | 'no'

    const offsets = useMemo(() => deck.map(() => Math.random() * 200 - 100), [deck]);
    const offsetX = offsets[index] || 0;
    const card = deck[index];
    const total = deck.length;

    /* ----------------------- Keyboard input ----------------------- */
    useEffect(() => {
        const onKey = (e) => {
            if (decision || stage === 'summary') return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') handleVote(e.key === 'ArrowRight');
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [decision, stage, card]);

    const handleVote = useCallback(
        (yes) => {
            if (!card) return;
            if (stage === 'round1') setLike((m) => ({ ...m, [card.name]: yes }));
            else setGood((m) => ({ ...m, [card.name]: yes }));
            setDecision(yes ? 'yes' : 'no');
        },
        [card, stage]
    );

    /* --------------- advance after swipe animation --------------- */
    const advance = useCallback(() => {
        setDecision(null);
        if (index + 1 < total) setIndex((i) => i + 1);
        else if (stage === 'round1') {
            setStage('round2');
            setIndex(0);
        } else {
            setStage('summary');
        }
    }, [index, total, stage]);

    useEffect(() => {
        if (!decision) return;
        const t = setTimeout(advance, 400);
        return () => clearTimeout(t);
    }, [decision, advance]);

    /* ------------------------ Restart game ----------------------- */
    const restart = () => {
        setDeck(shuffle(tasks));
        setLike({});
        setGood({});
        setStage('round1');
        setIndex(0);
        setDecision(null);
    };

    /* ------------------ Progress & summary data ------------------ */
    const likePct = (Object.keys(likeMap).length / total) * 100;
    const goodPct = (Object.keys(goodMap).length / total) * 100;

    const summary = useMemo(() => {
        if (stage !== 'summary') return null;
        const likeGood = [],
            likeBad = [],
            hateGood = [],
            hateBad = [];
        deck.forEach((s) => {
            const like = likeMap[s.name];
            const good = goodMap[s.name];
            if (like && good) likeGood.push(s);
            else if (like && !good) likeBad.push(s);
            else if (!like && good) hateGood.push(s);
            else hateBad.push(s);
        });
        return { likeGood, likeBad, hateGood, hateBad };
    }, [stage, deck, likeMap, goodMap]);

    /* ------------------------ Summary screen --------------------- */
    if (stage === 'summary' && summary) {
        const { width, height } = useWindowSize();
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
                    <Quadrant title="Superpowers" subtitle="Love & Good" items={summary.likeGood} color="green" />
                    <Quadrant title="Growth Zone" subtitle="Love & Bad" items={summary.likeBad} color="blue" />
                    <Quadrant title="Burnout Risk" subtitle="Hate & Good" items={summary.hateGood} color="amber" />
                    <Quadrant title="Delegate / Avoid" subtitle="Hate & Bad" items={summary.hateBad} color="red" />
                </motion.div>
                <Button onClick={restart} className="mt-4">
                    ↻ Do it again
                </Button>
            </div>
        );
    }

    /* ------------------------ Sorting screen --------------------- */
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
            <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-2 pointer-events-none">
                <h1 className="text-2xl font-semibold text-center">
                    {stage === 'round1' ? 'Round 1: Do you ENJOY this skill?' : 'Round 2: Are you GOOD at this skill?'}
                </h1>
                <p className="text-xs text-gray-500">Press ← for NO &nbsp;|&nbsp; → for YES</p>
                <div className="flex gap-4 mt-1">
                    <ProgressBar label="Enjoy" percent={likePct} active={stage === 'round1'} />
                    <ProgressBar label="Good" percent={goodPct} active={stage === 'round2'} />
                </div>
            </div>

            {card && (
                <motion.div
                    key={`${card.name}-${stage}-${index}`}
                    initial={{ y: -250, x: offsetX, opacity: 0.4, rotate: 0 }}
                    animate={
                        decision === 'yes'
                            ? { x: 500, rotate: 20, opacity: 0 }
                            : decision === 'no'
                                ? { x: -500, rotate: -20, opacity: 0 }
                                : { y: 500, opacity: 1, rotate: 0 }
                    }
                    transition={{ duration: decision ? 0.4 : 4, ease: 'easeOut' }}
                    className="absolute top-0 left-1/2 -translate-x-1/2"
                    onClick={() => !decision && handleVote(true)}
                >
                    <Card
                        className={`w-72 rounded-2xl shadow-xl backdrop-blur ${decision === 'yes'
                                ? 'ring-4 ring-green-400'
                                : decision === 'no'
                                    ? 'ring-4 ring-red-400'
                                    : 'ring-0'
                            }`}
                    >
                        <CardContent className="p-6 flex flex-col gap-2">
                            <h2 className="text-lg font-bold text-center">{card.name}</h2>
                            <p className="text-sm text-center text-gray-600">{card.description}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
