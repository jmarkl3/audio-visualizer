import React, { useRef, useEffect, useState } from 'react';

export default function AudioSync({ audioRef, onGridUpdate }) {
    const wsRef = useRef(null);
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        if (!audioRef?.current) return;

        const audio = audioRef.current;
        const ws = new WebSocket('wss://your-render-app.onrender.com');
        wsRef.current = ws;

        ws.onopen = () => console.log('Connected to audio sync server');
        ws.onclose = () => console.log('Disconnected');

        const handlePlay = () => {
            if (!audioContextRef.current) {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                audioContextRef.current = context;
                
                const analyser = context.createAnalyser();
                analyser.fftSize = 512;
                analyserRef.current = analyser;

                const source = context.createMediaElementSource(audio);
                source.connect(analyser);
                analyser.connect(context.destination);
            } else if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
        };

        audio.addEventListener('play', handlePlay);

        const analyzeAudio = () => {
            if (!analyserRef.current) {
                requestAnimationFrame(analyzeAudio);
                return;
            }

            const data = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(data);

            const gridSize = 16;
            const bins = [];
            const samplesPerBin = data.length / gridSize;
            
            for (let i = 0; i < gridSize; i++) {
                let sum = 0;
                for (let j = 0; j < samplesPerBin; j++) {
                    sum += data[Math.floor(i * samplesPerBin + j)];
                }
                bins.push(sum / samplesPerBin);
            }

            // Generate 16x16 grid data
            const gridData = Array(gridSize).fill().map(() => 
                Array(gridSize).fill({ r: 0, g: 0, b: 0 })
            );

            for (let x = 0; x < gridSize; x++) {
                const intensity = bins[x];
                const height = Math.floor((intensity / 255) * gridSize) || 0;

                for (let y = 0; y < gridSize; y++) {
                    if (gridSize - 1 - y < height) {
                        const pixelHeight = gridSize - 1 - y;
                        gridData[x][y] = getHeightColor(pixelHeight);
                    }
                }
            }

            // Send to parent component
            onGridUpdate(gridData);

            // Send to WebSocket server
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'grid_data',
                    data: gridData,
                    timestamp: Date.now()
                }));
            }

            requestAnimationFrame(analyzeAudio);
        };

        analyzeAudio();

        return () => {
            audio.removeEventListener('play', handlePlay);
            ws.close();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [audioRef, onGridUpdate]);

    const getHeightColor = (height) => {
        const r = Math.min(255, Math.floor(height * 16));
        const g = 0;
        const b = Math.max(0, Math.floor(255 - (height * 16)));
        return { r, g, b };
    };

    return null;
}