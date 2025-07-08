import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { skills } from './data/skills';

/*****************************************************************
 * Skill Sorter App – Severance-inspired mini-game
 * ---------------------------------------------------------------
 * ✓ Two-round sorting (Enjoy? → Good?)
 * ✓ Progress bars & swipe feedback
 * ✓ Confetti + colour-ring quadrants at the end
 *****************************************************************/

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

// Helper: Base64 encode/decode (URL-safe)
function encodeBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function decodeBase64(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

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
    const [deck, setDeck] = useState(() => shuffle(skills));
    const [decision, setDecision] = useState(null); // null | 'yes' | 'no'

    // Always call useWindowSize at the top level to avoid hook order issues
    // Only use its values when needed
    const windowSize = useWindowSize();

    const offsets = useMemo(() => deck.map(() => Math.random() * 200 - 100), [deck]);
    const offsetX = offsets[index] || 0;
    const card = deck[index];
    const total = deck.length;

    // For reading query params
    const location = window.location;
    const navigate = (url) => { window.history.pushState({}, '', url); };

    // On mount: check for ?data= param
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const dataParam = params.get('data');
        if (dataParam) {
            try {
                const decoded = decodeBase64(dataParam);
                const parsed = JSON.parse(decoded);
                // Validate structure
                if (
                    parsed &&
                    ['superpowers', 'growth', 'burnout', 'avoid'].every(k => Array.isArray(parsed[k]))
                ) {
                    // Hydrate skill names to full objects for quadrant display
                    const hydrate = (names) => skills.filter(s => names.includes(s.name));
                    setStage('summary');
                    setSummaryOverride({
                        ...parsed,
                        likeGood: hydrate(parsed.superpowers),
                        likeBad: hydrate(parsed.growth),
                        hateGood: hydrate(parsed.burnout),
                        hateBad: hydrate(parsed.avoid)
                    });
                }
            } catch (e) {
                setStage('error');
            }
        }
    }, []);
    // For summary override (from shared link)
    const [summaryOverride, setSummaryOverride] = useState(null);

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
        setDeck(shuffle(skills));
        setLike({});
        setGood({});
        setStage('round1');
        setIndex(0);
        setDecision(null);
        setSummaryOverride(null); // Reset summary override so new run is fresh
        // Clear URL params
        const base = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', base);
    };

    /* ------------------ Progress & summary data ------------------ */
    const likePct = (Object.keys(likeMap).length / total) * 100;
    const goodPct = (Object.keys(goodMap).length / total) * 100;

    // Build summary object for sharing
    const summary = useMemo(() => {
        if (summaryOverride) return summaryOverride;
        if (stage !== 'summary') return null;
        const likeGood = [], likeBad = [], hateGood = [], hateBad = [];
        deck.forEach((s) => {
            const like = likeMap[s.name];
            const good = goodMap[s.name];
            if (like && good) likeGood.push(s);
            else if (like && !good) likeBad.push(s);
            else if (!like && good) hateGood.push(s);
            else hateBad.push(s);
        });
        return {
            superpowers: likeGood.map(s => s.name),
            growth: likeBad.map(s => s.name),
            burnout: hateGood.map(s => s.name),
            avoid: hateBad.map(s => s.name),
            // For display, also keep full objects
            likeGood, likeBad, hateGood, hateBad
        };
    }, [stage, deck, likeMap, goodMap, summaryOverride]);

    // Shareable link logic
    const getShareUrl = () => {
        if (!summary) return window.location.href;
        // Only use names for compactness
        const data = JSON.stringify({
            superpowers: summary.superpowers,
            growth: summary.growth,
            burnout: summary.burnout,
            avoid: summary.avoid
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
    const [copied, setCopied] = useState(false);

    /* ------------------------ Summary screen --------------------- */
    if (stage === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h1 className="text-2xl font-bold mb-2">Invalid or Corrupted Link</h1>
                <p className="text-gray-500 mb-4">Sorry, we couldn't load these results. Please check your link or try again.</p>
                <Button onClick={restart}>Start Over</Button>
            </div>
        );
    }

    if (stage === 'summary' && summary) {
        // Only use windowSize values if needed
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
                    <Quadrant title="Superpowers" subtitle="Love & Good" items={summary.likeGood || []} color="green" />
                    <Quadrant title="Growth Zone" subtitle="Love & Bad" items={summary.likeBad || []} color="blue" />
                    <Quadrant title="Burnout Risk" subtitle="Hate & Good" items={summary.hateGood || []} color="amber" />
                    <Quadrant title="Delegate / Avoid" subtitle="Hate & Bad" items={summary.hateBad || []} color="red" />
                </motion.div>
                <div className="flex flex-row items-center gap-3 mt-2">
                    <Button onClick={handleCopyLink}>
                        {copied ? '✓ Link copied!' : '🔗 Copy Shareable Link'}
                    </Button>
                    <Button onClick={restart} variant="outline">
                        ↻ Do it again
                    </Button>
                </div>
            </div>
        );
    }

    /* ------------------------ Sorting screen --------------------- */
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
            <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-2 pointer-events-none">
                <h1 className="text-2xl font-semibold text-center text-black">
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
                    initial={{ y: -250, x: '-50%', opacity: 0.4, rotate: 0 }}
                    animate={
                        decision === 'yes'
                            ? { x: 500, rotate: 20, opacity: 0 }
                            : decision === 'no'
                                ? { x: -500, rotate: -20, opacity: 0 }
                                : { y: 500, x: `calc(${offsetX}px - 50%)`, opacity: 1, rotate: 0 }
                    }
                    transition={{ duration: decision ? 0.4 : 4, ease: 'easeOut' }}
                    className="absolute top-0 left-1/2"
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