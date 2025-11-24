'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Globe, Zap } from 'lucide-react';

interface Trend {
    topic: string;
    analysis: string;
    hypeScore: number;
}

export default function TrendScout() {
    const { setCurrentView } = useStore();
    const [trends, setTrends] = useState<Trend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrends() {
            try {
                const res = await fetch('/api/ai/trends');
                const data = await res.json();
                if (data.trends) {
                    setTrends(data.trends);
                }
            } catch (error) {
                console.error('Failed to fetch trends:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTrends();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container mx-auto p-8 min-h-screen"
        >
            <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center text-accent-teal hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="mr-2" /> Back to Deck
            </button>

            <header className="mb-12">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 flex items-center gap-4">
                    <Globe className="text-pink-500" size={48} /> TREND SCOUT
                </h1>
                <p className="text-gray-400 font-mono mt-2">
                    GLOBAL SIGNAL ANALYSIS // AI POWERED
                </p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 glass-panel rounded-xl animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(200px,auto)]">
                    {trends.map((trend, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass-panel p-6 rounded-xl flex flex-col justify-between hover:border-accent-teal/50 transition-colors ${i === 0 ? 'md:col-span-2 md:row-span-2 bg-gradient-to-br from-accent-purple/20 to-transparent' : ''
                                }`}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <TrendingUp className={i === 0 ? "text-accent-teal w-8 h-8" : "text-gray-500"} />
                                    <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-accent-teal">
                                        HYPE: {trend.hypeScore}/10
                                    </span>
                                </div>
                                <h3 className={`${i === 0 ? 'text-3xl' : 'text-xl'} font-bold text-white mb-4`}>
                                    {trend.topic}
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {trend.analysis}
                                </p>
                            </div>

                            {i === 0 && (
                                <div className="mt-8 flex gap-2">
                                    <span className="px-3 py-1 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-bold">VIRAL</span>
                                    <span className="px-3 py-1 rounded-full bg-accent-teal/20 text-accent-teal text-xs font-bold">RISING</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
