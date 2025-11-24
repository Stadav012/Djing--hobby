import { NextResponse } from 'next/server';
import { scanMusicDirectory } from '@/lib/scanner';
import path from 'path';

export async function GET() {
    try {
        // Scan the parent directory (workspace root)
        // In production/deployment this might need adjustment, but for local tool it's fine
        const rootDir = path.resolve(process.cwd(), '..');
        const folders = await scanMusicDirectory(rootDir);

        return NextResponse.json({ folders });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to scan music directory' }, { status: 500 });
    }
}
