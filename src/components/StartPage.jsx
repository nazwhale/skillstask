import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

const StartPage = ({ onStart }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl w-full"
        >
            <Card className="w-full rounded-2xl shadow-xl bg-white/90 backdrop-blur">
                <CardContent className="p-8 text-center">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                        className="mb-6"
                    >
                        <h1 className="text-4xl font-bold text-slate-800 mb-2">
                            Skill Sorter
                        </h1>
                        <p className="text-lg text-slate-600">
                            Discover your professional superpowers
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="space-y-6 mb-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <h3 className="font-semibold text-blue-800 mb-2">Round 1: Enjoyment</h3>
                                <p className="text-sm text-blue-700">
                                    Sort through skills based on what you genuinely enjoy doing
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <h3 className="font-semibold text-green-800 mb-2">Round 2: Proficiency</h3>
                                <p className="text-sm text-green-700">
                                    Evaluate each skill based on your current level of expertise
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-2">What You'll Discover</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                                    <span className="text-slate-700">Superpowers</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                                    <span className="text-slate-700">Growth Zone</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                                    <span className="text-slate-700">Burnout Risk</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                                    <span className="text-slate-700">Delegate/Avoid</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                    >
                        <Button
                            onClick={onStart}
                            size="lg"
                            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            Start Sorting
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    </div>
);

export default StartPage; 