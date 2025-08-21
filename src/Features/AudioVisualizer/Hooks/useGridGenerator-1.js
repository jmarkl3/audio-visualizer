import { useRef, useEffect, useCallback } from 'react';

// Custom hook to keep an up to date grid based on the audio ref
export function useGridGenerator(audioRef) {
    const gridDataRef = useRef(
        Array(16).fill().map(() => 
            Array(16).fill({ r: 0, g: 0, b: 0 })
        )
    );
    const analyserRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        if (!audioRef?.current) return;

        const audio = audioRef.current;

        const handlePlay = () => {
            if (audioContextRef.current) {
                if (audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume();
                }
                return;
            }
            
            // Create audio context and analyser
            const context = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = context;
            
            const analyser = context.createAnalyser();
            analyser.fftSize = 512;
            analyserRef.current = analyser;

            const source = context.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(context.destination);

            // Start the analysis loop
            const analyze = () => {
                if (!analyserRef.current) return;

                try {
                    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(data);

                    const gridSize = 16;
                    const bins = [];
                    const samplesPerBin = Math.floor(data.length / gridSize);
                    
                    // Process audio data into 16 frequency bins
                    for (let i = 0; i < gridSize; i++) {
                        let sum = 0;
                        const start = i * samplesPerBin;
                        const end = start + samplesPerBin;
                        for (let j = start; j < end; j++) {
                            sum += data[j];
                        }
                        bins.push(sum / samplesPerBin);
                    }

                    // Update the grid data
                    const newGrid = Array(gridSize).fill().map(() => 
                        Array(gridSize).fill({ r: 0, g: 0, b: 0 })
                    );

                    for (let x = 0; x < gridSize; x++) {
                        const intensity = bins[x];
                        const height = Math.floor((intensity / 255) * gridSize) || 0;

                        for (let y = 0; y < gridSize; y++) {
                            if (gridSize - 1 - y < height) {
                                const pixelHeight = gridSize - 1 - y;
                                const r = Math.min(255, Math.floor(pixelHeight * 16));
                                const g = 0;
                                const b = Math.max(0, Math.floor(255 - (pixelHeight * 16)));
                                newGrid[x][y] = { r, g, b };
                            }
                        }
                    }

                    gridDataRef.current = newGrid;

                } catch (error) {
                    console.log('Audio analysis error:', error);
                }

                requestAnimationFrame(analyze);
            };

            analyze();
        };

        audio.addEventListener('play', handlePlay);

        return () => {
            audio.removeEventListener('play', handlePlay);
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {});
            }
        };
    }, [audioRef]);

    const getGrid = useCallback(() => {
        return gridDataRef.current;
    }, []);

    return { getGrid };
}