import { useRef, useEffect, useCallback } from 'react'

// Custom hook to keep an up-to-date 12x8 grid of 0s or 1s based on audio input
export function useGridGenerator8x12(audioRef, gridHeight = 8, gridWidth = 12) {
    const gridDataRef = useRef(
        Array(gridHeight).fill().map(() => 
            Array(gridWidth).fill(0)
        )
    )
    const analyserRef = useRef(null)
    const audioContextRef = useRef(null)

    useEffect(() => {
        if (!audioRef?.current) return

        const audio = audioRef.current

        const handlePlay = () => {
            if (audioContextRef.current) {
                if (audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume()
                }
                return
            }
            
            // Create audio context and analyser
            const context = new (window.AudioContext || window.webkitAudioContext)()
            audioContextRef.current = context
            
            const analyser = context.createAnalyser()
            analyser.fftSize = 512
            analyserRef.current = analyser

            const source = context.createMediaElementSource(audio)
            source.connect(analyser)
            analyser.connect(context.destination)

            // Start the analysis loop
            const analyze = () => {
                if (!analyserRef.current) return

                try {
                    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
                    analyserRef.current.getByteFrequencyData(data)

                    // const gridHeight = 8
                    // const gridWidth = 12
                    const bins = []
                    const samplesPerBin = Math.floor(data.length / gridWidth)
                    
                    // Process audio data into 12 frequency bins
                    for (let i = 0; i < gridWidth; i++) {
                        let sum = 0
                        const start = i * samplesPerBin
                        const end = start + samplesPerBin
                        for (let j = start; j < end; j++) {
                            sum += data[j]
                        }
                        bins.push(sum / samplesPerBin)
                    }

                    // Update the grid data (8x12 grid of 0s and 1s)
                    const newGrid = Array(gridHeight).fill().map(() => 
                        Array(gridWidth).fill(0)
                    )

                    for (let x = 0; x < gridWidth; x++) {
                        const intensity = bins[x]
                        // Map intensity (0-255) to a height in the grid (0-8)
                        const height = Math.floor((intensity / 255) * gridHeight) || 0

                        for (let y = 0; y < gridHeight; y++) {
                            if (gridHeight - 1 - y < height) {
                                newGrid[y][x] = 1 // Set to 1 where intensity is sufficient
                            }
                        }
                    }

                    gridDataRef.current = newGrid

                } catch (error) {
                    console.log('Audio analysis error:', error)
                }

                requestAnimationFrame(analyze)
            }

            analyze()
        }

        audio.addEventListener('play', handlePlay)

        return () => {
            audio.removeEventListener('play', handlePlay)
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {})
            }
        }
    }, [audioRef])

    const getGrid = useCallback(() => {
        return gridDataRef.current
    }, [])

    return { getGrid }
}