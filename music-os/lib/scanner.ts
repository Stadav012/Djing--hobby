import fs from 'fs/promises';
import path from 'path';
import * as mm from 'music-metadata';
import { MusicFolder, Track } from './types';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.m4a', '.aac']);

export async function scanMusicDirectory(rootDir: string): Promise<MusicFolder[]> {
    const folders: MusicFolder[] = [];

    try {
        const entries = await fs.readdir(rootDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'music-os' && entry.name !== 'node_modules') {
                const folderPath = path.join(rootDir, entry.name);
                const folderData = await processFolder(folderPath, entry.name);
                if (folderData.trackCount > 0) {
                    folders.push(folderData);
                }
            }
        }
    } catch (error) {
        console.error('Error scanning directory:', error);
    }

    return folders;
}

async function processFolder(folderPath: string, folderName: string): Promise<MusicFolder> {
    const tracks: Track[] = [];

    try {
        const entries = await fs.readdir(folderPath, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isFile() && AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
                const filePath = path.join(folderPath, entry.name);
                try {
                    const metadata = await mm.parseFile(filePath);

                    let picture: string | undefined;
                    if (metadata.common.picture && metadata.common.picture.length > 0) {
                        const pic = metadata.common.picture[0];
                        const base64Data = Buffer.from(pic.data).toString('base64');
                        picture = `data:${pic.format};base64,${base64Data}`;
                    }

                    tracks.push({
                        filePath,
                        fileName: entry.name,
                        title: metadata.common.title || entry.name,
                        artist: metadata.common.artist,
                        album: metadata.common.album,
                        year: metadata.common.year,
                        genre: metadata.common.genre,
                        duration: metadata.format.duration,
                        bpm: metadata.common.bpm,
                        key: metadata.common.key,
                        picture
                    });
                } catch (err) {
                    console.warn(`Failed to parse metadata for ${entry.name}:`, err);
                    // Add basic track info even if metadata fails
                    tracks.push({
                        filePath,
                        fileName: entry.name
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Error processing folder ${folderName}:`, error);
    }

    const bpmSum = tracks.reduce((sum, t) => sum + (t.bpm || 0), 0);
    const avgBpm = tracks.filter(t => t.bpm).length > 0 ? Math.round(bpmSum / tracks.filter(t => t.bpm).length) : undefined;

    return {
        name: folderName,
        path: folderPath,
        trackCount: tracks.length,
        tracks,
        avgBpm
    };
}
