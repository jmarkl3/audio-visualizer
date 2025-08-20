import React, { useEffect, useRef } from 'react'

export default function GridSimulator({ audioRef }) {
    const canvasRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    const audioContextRef = useRef(null);

    useEffect(() => {
        if (!audioRef?.current) return;

        const audio = audioRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const gridSize = 16;
        const cellSize = canvas.width / gridSize;

        // When the audio begins to play
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

        // Put an event listener on the audio tag to listen for the play event
        audio.addEventListener('play', handlePlay);
        
        // Animate the audio
        const animate = () => {
            if (!analyserRef.current) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            const data = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(data);

            // ... rest of your animation code
            const bins = [];
            const samplesPerBin = data.length / gridSize;
            for (let i = 0; i < gridSize; i++) {
                let sum = 0;
                for (let j = 0; j < samplesPerBin; j++) {
                    sum += data[Math.floor(i * samplesPerBin + j)];
                }
                bins.push(sum / samplesPerBin);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let x = 0; x < gridSize; x++) {
                const intensity = bins[x];
                const height = Math.floor((intensity / 255) * gridSize) || 0;

                for (let y = 0; y < gridSize; y++) {
                    let color = { r: 0, g: 0, b: 0 };
                    if (gridSize - 1 - y < height) {
                        const levelFromBottom = gridSize - 1 - y;
                        if (levelFromBottom < 5) {
                            color = { r: 0, g: 255, b: 0 };
                        } else if (levelFromBottom < 10) {
                            color = { r: 255, g: 255, b: 0 };
                        } else {
                            color = { r: 255, g: 0, b: 0 };
                        }
                    }
                    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationRef.current);
            audio.removeEventListener('play', handlePlay);
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [audioRef]);

    return (
        <canvas
            ref={canvasRef}
            width={320}
            height={320}
            style={{ 
                border: '1px solid #d9d9d9', 
                marginTop: "50px",
            }}
        />
    );
}