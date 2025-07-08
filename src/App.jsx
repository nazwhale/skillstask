import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { PowerBar } from './components/ui/PowerBar';
import SkillQuadrantsSummary from './components/SkillQuadrantsSummary';
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
const ProgressBar = ({ label, percent, active, color, emoji }) => (
    <div className="w-32">
        <p className="text-[10px] text-center mb-0.5 font-medium tracking-wide">
            {emoji} {label}
        </p>
        <div className="w-full h-2 rounded bg-gray-300 overflow-hidden">
            <div
                style={{ width: `${percent}%` }}
                className={`h-full transition-all duration-300 ${active ? color : 'bg-blue-400/40'}`}
            />
        </div>
    </div>
);

/* -------------------------- Main app --------------------------- */
export default function SkillSorter() {
    const [stage, setStage] = useState('round1');
    const [index, setIndex] = useState(0);
    const [likeMap, setLike] = useState({});
    const [goodMap, setGood] = useState({});
    const [likeIntensity, setLikeIntensity] = useState({}); // Store intensity for Enjoy decisions
    const [goodIntensity, setGoodIntensity] = useState({}); // Store intensity for Good decisions
    const [deck, setDeck] = useState(() => shuffle(skills));
    const [decision, setDecision] = useState(null); // null | 'yes' | 'no'

    // Power system state
    const [pressStart, setPressStart] = useState(null);
    const [pressDuration, setPressDuration] = useState(0);
    const [isPressing, setIsPressing] = useState(false);
    const [powerLevel, setPowerLevel] = useState(0);

    // Mini stack size for upcoming cards
    const MINI_STACK_SIZE = 4;
    // Get the next MINI_STACK_SIZE cards after the current index
    const upcomingCards = deck.slice(index + 1, index + 1 + MINI_STACK_SIZE);
    // Base Y position to align mini stack with main card
    const BASE_Y = 500;

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

                    // Restore intensity data if available
                    if (parsed.intensity) {
                        const intensity = parsed.intensity;
                        const likeInt = {}, goodInt = {};

                        // Extract intensity values for each skill
                        Object.keys(intensity).forEach(skillName => {
                            const skillIntensity = intensity[skillName];
                            if (skillIntensity.enjoy !== undefined) likeInt[skillName] = skillIntensity.enjoy;
                            if (skillIntensity.good !== undefined) goodInt[skillName] = skillIntensity.good;
                        });

                        setLikeIntensity(likeInt);
                        setGoodIntensity(goodInt);
                    }

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
        const onKeyDown = (e) => {
            if (decision || stage === 'summary') return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                if (!isPressing) {
                    setPressStart(Date.now());
                    setIsPressing(true);
                    setPowerLevel(0);
                }
            }
        };

        const onKeyUp = (e) => {
            if (decision || stage === 'summary') return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                if (isPressing) {
                    const duration = Date.now() - pressStart;
                    setPressDuration(duration);
                    setIsPressing(false);
                    setPressStart(null);

                    // Calculate final power level (0-100)
                    const maxDuration = 1000; // 1 second for full power
                    const finalPower = Math.min((duration / maxDuration) * 100, 100);
                    setPowerLevel(finalPower);

                    // Trigger vote with power level
                    handleVote(e.key === 'ArrowRight', finalPower);
                }
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [decision, stage, card, isPressing, pressStart]);

    // Update power level during press
    useEffect(() => {
        if (!isPressing || !pressStart) return;

        const interval = setInterval(() => {
            const duration = Date.now() - pressStart;
            const maxDuration = 1000; // 1 second for full power
            const currentPower = Math.min((duration / maxDuration) * 100, 100);
            setPowerLevel(currentPower);
        }, 16); // ~60fps updates

        return () => clearInterval(interval);
    }, [isPressing, pressStart]);

    const handleVote = useCallback(
        (yes, power = 0) => {
            if (!card) return;
            if (stage === 'round1') {
                setLike((m) => ({ ...m, [card.name]: yes }));
                setLikeIntensity((m) => ({ ...m, [card.name]: power }));
            } else {
                setGood((m) => ({ ...m, [card.name]: yes }));
                setGoodIntensity((m) => ({ ...m, [card.name]: power }));
            }
            setDecision(yes ? 'yes' : 'no');
        },
        [card, stage]
    );

    /* --------------- advance after swipe animation --------------- */
    const advance = useCallback(() => {
        setDecision(null);
        setPowerLevel(0);
        setIsPressing(false);
        setPressStart(null);
        setPressDuration(0);
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
        setLikeIntensity({});
        setGoodIntensity({});
        setStage('round1');
        setIndex(0);
        setDecision(null);
        setSummaryOverride(null); // Reset summary override so new run is fresh
        setPowerLevel(0);
        setIsPressing(false);
        setPressStart(null);
        setPressDuration(0);
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
        const intensityData = {};

        deck.forEach((s) => {
            const like = likeMap[s.name];
            const good = goodMap[s.name];
            const likeInt = likeIntensity[s.name] || 0;
            const goodInt = goodIntensity[s.name] || 0;

            // Store intensity data for this skill
            intensityData[s.name] = {
                enjoy: likeInt,
                good: goodInt,
                total: likeInt + goodInt
            };

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
            likeGood, likeBad, hateGood, hateBad,
            // Include intensity data for sorting and sharing
            intensity: intensityData
        };
    }, [stage, deck, likeMap, goodMap, likeIntensity, goodIntensity, summaryOverride]);

    /* ------------------------ Error screen ----------------------- */
    if (stage === 'error') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <h1 className="text-2xl font-bold mb-2">Invalid or Corrupted Link</h1>
                <p className="text-gray-500 mb-4">Sorry, we couldn't load these results. Please check your link or try again.</p>
                <Button onClick={restart}>Start Over</Button>
            </div>
        );
    }

    /* ------------------------ Summary screen --------------------- */
    if (stage === 'summary' && summary) {
        return <SkillQuadrantsSummary summary={summary} onRestart={restart} />;
    }

    /* ------------------------ Sorting screen --------------------- */
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
            <div className="absolute inset-x-0 top-4 flex flex-col items-center gap-2 pointer-events-none">
                <h1 className="text-2xl font-semibold text-center text-black">
                    {stage === 'round1' ? 'Round 1: Do you ENJOY this skill?' : 'Round 2: Are you GOOD at this skill?'}
                </h1>
                <p className="text-xs text-gray-500">Hold ← for NO &nbsp;|&nbsp; Hold → for YES (longer = faster!)</p>
                <div className="flex gap-4 mt-1">
                    <ProgressBar label="Enjoy" percent={likePct} active={stage === 'round1'} color="bg-blue-500" emoji="😊" />
                    <ProgressBar label="Good" percent={goodPct} active={stage === 'round2'} color="bg-green-500" emoji="👍" />
                </div>
            </div>

            {/* Mini stack of upcoming cards */}
            <div className="absolute top-0 left-1/2 w-72 h-44 -translate-x-1/2 pointer-events-none z-0">
                {upcomingCards.map((c, i) => (
                    <motion.div
                        key={c.name}
                        className="absolute left-1/2 top-0"
                        initial={{
                            scale: 0.92 - i * 0.08,
                            y: BASE_Y + i * 12,
                            opacity: 0.5 - i * 0.1,
                        }}
                        animate={{
                            scale: 0.92 - i * 0.08,
                            y: BASE_Y + i * 12,
                            opacity: 0.5 - i * 0.1,
                        }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{
                            transform: `translateX(-50%)`,
                            zIndex: i,
                            pointerEvents: 'none',
                        }}
                    >
                        <Card className="w-64 rounded-xl shadow-md bg-white/80">
                            <CardContent className="p-3 text-xs text-center">{c.emoji} {c.name}</CardContent>
                        </Card>
                    </motion.div>
                ))}
                {/* Cards left counter */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 mb-2">
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${stage === 'round2' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {total - index - 1} card{total - index - 1 === 1 ? '' : 's'} left
                    </span>
                </div>
            </div>

            {card && (
                <motion.div
                    key={`${card.name}-${stage}-${index}`}
                    initial={{ y: -250, x: '-50%', opacity: 0.4, rotate: 0, scale: 1 }}
                    animate={
                        decision === 'yes'
                            ? {
                                x: 500,
                                rotate: 20 + (powerLevel * 0.3),
                                opacity: 0,
                                scale: 1 + (powerLevel * 0.002)
                            }
                            : decision === 'no'
                                ? {
                                    x: -500,
                                    rotate: -20 - (powerLevel * 0.3),
                                    opacity: 0,
                                    scale: 1 + (powerLevel * 0.002)
                                }
                                : {
                                    y: 500,
                                    x: `calc(${offsetX}px - 50%)`,
                                    opacity: 1,
                                    rotate: 0,
                                    scale: 1 + (isPressing ? powerLevel * 0.001 : 0)
                                }
                    }
                    transition={{
                        duration: decision ? (1.5 - (powerLevel * 0.013)) : 4,
                        ease: decision ? (powerLevel > 50 ? "easeIn" : "easeOut") : "easeOut"
                    }}
                    className="absolute top-0 left-1/2"
                    onClick={() => !decision && handleVote(true)}
                >
                    <Card
                        className={`w-72 rounded-2xl shadow-xl backdrop-blur ${decision === 'yes'
                            ? 'ring-4 ring-green-400'
                            : decision === 'no'
                                ? 'ring-4 ring-red-400'
                                : 'ring-0'
                            } ${stage === 'round1'
                                ? 'shadow-[0_0_24px_4px_rgba(59,130,246,0.15)] shadow-blue-400/40' // blue glow for Enjoy
                                : 'shadow-[0_0_24px_4px_rgba(34,197,94,0.18)] shadow-green-400/40' // green glow for Good
                            }`}
                        style={{
                            boxShadow: isPressing ? `0 0 ${24 + powerLevel * 0.5}px ${4 + powerLevel * 0.1}px rgba(59,130,246,${0.15 + powerLevel * 0.002})` : undefined
                        }}
                    >
                        <CardContent className="p-6 flex flex-col gap-2">
                            <h2 className="text-lg font-bold text-center">{card.emoji} {card.name}</h2>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Power Bar */}
            <PowerBar powerLevel={powerLevel} isVisible={isPressing} />

            {/* Static card description at bottom center */}
            {card && (
                <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none z-10">
                    <div className="bg-white/80 text-gray-700 text-xl px-8 py-4 rounded-xl shadow max-w-xl text-center border border-gray-200">
                        {card.description}
                    </div>
                </div>
            )}
        </div>
    );
} 