'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { MusicFolder } from '@/lib/types';

interface VinylProps {
    folder: MusicFolder;
    onClick: () => void;
}



function useSafeTexture(url: string | null) {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);

    useEffect(() => {
        if (!url) {
            setTexture(null);
            return;
        }

        const loader = new THREE.TextureLoader();
        loader.load(
            url,
            (tex) => {
                tex.colorSpace = THREE.SRGBColorSpace;
                setTexture(tex);
            },
            undefined,
            (err) => {
                console.warn('Failed to load texture:', err);
                setTexture(null);
            }
        );
    }, [url]);

    return texture;
}

export function Vinyl({ folder, onClick }: VinylProps) {
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    // Get cover art from a random track in the folder that has a picture
    const coverArt = React.useMemo(() => {
        const tracksWithArt = folder.tracks.filter(t => t.picture);
        console.log(`[Vinyl] Folder: ${folder.name}, Tracks: ${folder.tracks.length}, With Art: ${tracksWithArt.length}`);
        if (tracksWithArt.length > 0) {
            const randomIndex = Math.floor(Math.random() * tracksWithArt.length);
            const art = tracksWithArt[randomIndex].picture;
            console.log(`[Vinyl] Selected art for ${folder.name}:`, art ? art.substring(0, 50) + '...' : 'null');
            return art;
        }
        console.log(`[Vinyl] No art found for ${folder.name}`);
        return null;
    }, [folder]);

    const texture = useSafeTexture(coverArt);

    useEffect(() => {
        if (texture) {
            console.log(`[Vinyl] Texture loaded for ${folder.name}`);
        }
    }, [texture, folder.name]);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Floating animation - smooth sine wave
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5 + folder.name.length) * 0.1 - 0.5;

            // Interactive Tilt - Default is tilted back like in a crate
            const targetRotX = hovered ? 0 : -0.1; // Tilt back by default, straighten on hover
            const targetRotY = hovered ? 0 : -0.2; // Angled side view by default, face front on hover

            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 0.1);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 0.1);
        }
    });

    return (
        <group
            ref={meshRef}
            onClick={onClick}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={3.5}
            rotation={[0, 0, 0]} // Initial rotation handled by useFrame
        >
            {/* Glassy Sleeve Case */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.02, 1.02, 0.06]} />
                <meshPhysicalMaterial
                    color="#ffffff"
                    transmission={0.5}
                    opacity={0.5}
                    metalness={0.1}
                    roughness={0.1}
                    thickness={0.1}
                    transparent
                />
            </mesh>

            {/* Album Art (Full Bleed) */}
            <mesh position={[0, 0, 0.031]}>
                <planeGeometry args={[1, 1]} />
                {texture ? (
                    <meshBasicMaterial
                        map={texture}
                        toneMapped={false}
                        color="white"
                        needsUpdate={true}
                    />
                ) : (
                    <meshBasicMaterial color={stringToColor(folder.name)} />
                )}
            </mesh>

            {/* Back Cover (Dark) */}
            <mesh position={[0, 0, -0.031]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial color="#111" roughness={0.8} />
            </mesh>

            {/* Vinyl Record (Slides out) */}
            <group position={[hovered ? 0.6 : 0, 0, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.48, 0.48, 0.04, 64]} />
                    <meshPhysicalMaterial
                        color="#050505"
                        roughness={0.4}
                        metalness={0.8}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                    />
                </mesh>
                {/* Label */}
                <mesh position={[0, 0.021, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.04, 32]} />
                    <meshBasicMaterial color={stringToColor(folder.name)} />
                </mesh>
            </group>

            {/* Glowing Edge Effect (Neon) */}
            {hovered && (
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1.05, 1.05, 0.05]} />
                    <meshBasicMaterial color="#8b5cf6" transparent opacity={0.2} side={THREE.BackSide} />
                </mesh>
            )}
        </group>
    );
}

// Helper to generate consistent colors from strings
function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}
