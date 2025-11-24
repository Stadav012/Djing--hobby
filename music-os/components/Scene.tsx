'use client';

import { Canvas } from '@react-three/fiber';
import { View, Preload } from '@react-three/drei';

export default function Scene({ style, ...props }: React.ComponentProps<typeof Canvas>) {
    return (
        <Canvas
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 50,
                ...style,
            }}
            eventSource={document.body}
            {...props}
        >
            <View.Port />
            <Preload all />
        </Canvas>
    );
}
