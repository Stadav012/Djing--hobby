'use client';

import React, { useEffect, useRef } from 'react';
import { useStore } from '@/hooks/useStore';
import { Vinyl } from './Vinyl';
import { View } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
    const { folders, setFolders, setSelectedFolder } = useStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        async function fetchFolders() {
            try {
                const res = await fetch('/api/scan');
                const data = await res.json();
                if (data.folders) {
                    setFolders(data.folders);
                }
            } catch (error) {
                console.error('Failed to fetch folders:', error);
            }
        }
        fetchFolders();
    }, [setFolders]);



    if (folders.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center text-accent-teal">
                <Loader2 className="h-10 w-10 animate-spin" />
                <span className="ml-4 text-xl font-mono">Scanning System...</span>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-bg-dark overflow-hidden">
            <header className="flex-shrink-0 flex justify-between items-center p-8 z-30">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-purple to-accent-teal">
                        MUSIC OS // SHELF
                    </h1>
                    <p className="text-gray-400 font-mono mt-2 text-sm tracking-widest">
                        {folders.length} CRATES DETECTED
                    </p>
                </div>
                <button
                    onClick={() => useStore.getState().setCurrentView('trends')}
                    className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-mono text-accent-teal flex items-center gap-2"
                >
                    <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse" />
                    TREND SCOUT
                </button>
            </header>

            {/* Immersive Shelf Container - Tighter "Crate" Spacing */}
            <div className="flex-1 w-full overflow-x-auto overflow-y-hidden pb-12 px-24 flex items-center -space-x-24 snap-x snap-mandatory scrollbar-hide perspective-1000">
                {folders.map((folder, index) => (
                    <motion.div
                        key={folder.path}
                        initial={{ opacity: 0, scale: 0.8, rotateY: 25, x: 100 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0, x: 0 }}
                        transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                        className="relative flex-shrink-0 h-[600px] aspect-[3/4] group cursor-pointer snap-center transition-all duration-500 hover:z-50 hover:scale-110 hover:-translate-y-4 hover:rotate-y-0"
                        style={{ zIndex: index }}
                        onClick={() => setSelectedFolder(folder)}
                    >
                        {/* 3D Viewport - No borders, just floating content */}
                        <div className="absolute inset-0 z-10">
                            <View className="h-full w-full">
                                <ambientLight intensity={1.5} />
                                <pointLight position={[5, 5, 5]} intensity={3} color="#8b5cf6" />
                                <pointLight position={[-5, -5, 5]} intensity={2} color="#14b8a6" />
                                <spotLight position={[0, 10, 0]} angle={0.5} penumbra={1} intensity={2} color="#fff" />
                                <React.Suspense fallback={null}>
                                    <Vinyl folder={folder} onClick={() => setSelectedFolder(folder)} />
                                </React.Suspense>
                            </View>
                        </div>

                        {/* Holographic HUD Info - Appears on Hover */}
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[120%] opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 pointer-events-none">
                            <div className="bg-black/80 backdrop-blur-xl border border-accent-teal/30 p-4 rounded-lg text-center shadow-[0_0_30px_rgba(20,184,166,0.2)]">
                                <h3 className="text-xl font-bold text-white tracking-widest uppercase glow-text">{folder.name}</h3>
                                <div className="flex justify-center gap-4 text-xs font-mono text-accent-teal mt-2">
                                    <span className="px-2 py-1 bg-accent-teal/10 rounded">{folder.trackCount} TRACKS</span>
                                    {folder.avgBpm && <span className="px-2 py-1 bg-accent-purple/10 rounded text-accent-purple">{folder.avgBpm} BPM</span>}
                                </div>
                            </div>
                            {/* Connecting Line */}
                            <div className="w-px h-8 bg-gradient-to-t from-accent-teal/50 to-transparent mx-auto -mt-1" />
                        </div>
                    </motion.div>
                ))}

                {/* Padding at end */}
                <div className="w-24 flex-shrink-0" />
            </div>
        </div>
    );
}
