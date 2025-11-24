import { create } from 'zustand';
import { MusicFolder, Track } from '@/lib/types';

interface AppState {
    folders: MusicFolder[];
    selectedFolder: MusicFolder | null;
    currentTrack: Track | null;
    isPlaying: boolean;
    setFolders: (folders: MusicFolder[]) => void;
    setSelectedFolder: (folder: MusicFolder | null) => void;
    setCurrentTrack: (track: Track | null) => void;
    currentView: 'dashboard' | 'playlist' | 'trends';
    setCurrentView: (view: 'dashboard' | 'playlist' | 'trends') => void;
    setIsPlaying: (isPlaying: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    folders: [],
    selectedFolder: null,
    currentTrack: null,
    isPlaying: false,
    currentView: 'dashboard',
    setFolders: (folders) => set({ folders }),
    setSelectedFolder: (folder) => set({ selectedFolder: folder, currentView: folder ? 'playlist' : 'dashboard' }),
    setCurrentTrack: (track) => set({ currentTrack: track }),
    setIsPlaying: (isPlaying) => set({ isPlaying }),
    setCurrentView: (view) => set({ currentView: view }),
}));
