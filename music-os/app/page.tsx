'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/hooks/useStore';
// import Scene from '@/components/Scene'; // Remove static import
import Dashboard from '@/components/Dashboard';
import PlaylistView from '@/components/PlaylistView';
import TrendScout from '@/components/TrendScout';
import { AnimatePresence } from 'framer-motion';

const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function Home() {
  const { currentView } = useStore();
  const mainRef = useRef<HTMLElement>(null!);

  return (
    <main ref={mainRef} className="relative min-h-screen bg-background text-foreground overflow-hidden selection:bg-accent-purple selection:text-white">
      {/* Shared 3D Scene */}
      <Scene eventSource={mainRef} />

      {/* Content Layer */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && <Dashboard key="dashboard" />}
          {currentView === 'playlist' && <PlaylistView key="playlist" />}
          {currentView === 'trends' && <TrendScout key="trends" />}
        </AnimatePresence>
      </div>

      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-purple/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-teal/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>
    </main>
  );
}
