'use client';

import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Sparkles, Music2, Activity } from 'lucide-react';
import { Track, MixRecommendation } from '@/lib/types';

export default function PlaylistView() {
    const { selectedFolder, setSelectedFolder } = useStore();
    const [mixRecommendations, setMixRecommendations] = useState<MixRecommendation[] | null>(null);
    const [loadingMix, setLoadingMix] = useState(false);
    const [selectedTrackForMix, setSelectedTrackForMix] = useState<Track | null>(null);

    if (!selectedFolder) return null;

    const handleMixDoctor = async (track: Track) => {
        setSelectedTrackForMix(track);
        setLoadingMix(true);
        setMixRecommendations(null);

        try {
            const res = await fetch('/api/ai/mix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    track,
                    folderTracks: selectedFolder.tracks.filter(t => t.fileName !== track.fileName)
                })
            });
            const data = await res.json();
            if (data.recommendations) {
                setMixRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error('Mix Doctor failed:', error);
        } finally {
            setLoadingMix(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="container mx-auto p-8 min-h-screen pb-24"
        >
            <button
                onClick={() => setSelectedFolder(null)}
                className="flex items-center text-accent-teal hover:text-white mb-8 transition-colors"
            >
                <ArrowLeft className="mr-2" /> Back to Deck
            </button>

            <div className="flex items-end justify-between mb-12 border-b border-glass-border pb-8">
                <div>
                    <h1 className="text-6xl font-bold text-white mb-2">{selectedFolder.name}</h1>
                    <div className="flex gap-4 text-gray-400 font-mono">
                        <span>{selectedFolder.trackCount} TRACKS</span>
                        <span>AVG BPM: {selectedFolder.avgBpm || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Track List */}
                <div className="lg:col-span-2 space-y-2">
                    {selectedFolder.tracks.map((track, idx) => (
                        <div
                            key={track.filePath}
                            className="group flex items-center justify-between p-4 glass-panel rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 font-mono w-8">{idx + 1}</span>
                                {track.picture ? (
                                    <img src={track.picture} alt="Art" className="w-12 h-12 rounded object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center">
                                        <Music2 className="text-gray-600" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-white">{track.title}</h3>
                                    <p className="text-sm text-gray-400">{track.artist || 'Unknown Artist'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right hidden md:block">
                                    <div className="text-accent-purple font-mono text-sm">{track.key || '-'}</div>
                                    <div className="text-gray-500 text-xs">{track.bpm ? `${track.bpm} BPM` : '-'}</div>
                                </div>

                                <button
                                    onClick={() => handleMixDoctor(track)}
                                    className="p-2 rounded-full hover:bg-accent-purple/20 text-gray-400 hover:text-accent-purple transition-colors"
                                    title="Ask Mix Doctor"
                                >
                                    <Sparkles size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mix Doctor Panel */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 rounded-xl sticky top-8 min-h-[500px]">
                        <h2 className="text-2xl font-bold text-accent-teal mb-6 flex items-center gap-2">
                            <Activity /> MIX DOCTOR
                        </h2>

                        {!selectedTrackForMix && (
                            <div className="text-gray-500 text-center mt-20">
                                <Sparkles className="mx-auto mb-4 opacity-50" size={48} />
                                <p>Select a track to analyze mixing compatibility.</p>
                            </div>
                        )}

                        {loadingMix && (
                            <div className="text-center mt-20">
                                <div className="animate-pulse text-accent-purple font-mono">ANALYZING HARMONICS...</div>
                            </div>
                        )}

                        {mixRecommendations && (
                            <div className="space-y-4">
                                <div className="mb-4 p-3 bg-accent-purple/10 rounded border border-accent-purple/30">
                                    <div className="text-xs text-accent-purple uppercase tracking-wider">Base Track</div>
                                    <div className="font-bold">{selectedTrackForMix?.title}</div>
                                </div>

                                {mixRecommendations.map((rec, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-4 bg-white/5 rounded-lg border-l-2 border-accent-teal"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white text-sm">{rec.track.fileName}</h4>
                                            <span className="text-xs font-mono text-accent-teal">{rec.compatibilityScore}% MATCH</span>
                                        </div>
                                        <p className="text-xs text-gray-400 leading-relaxed">{rec.reason}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
