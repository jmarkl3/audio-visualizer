import React, { useRef, useEffect } from 'react'

export default function GridSimulator8x12({ gridData, useHeightBasedColor = false }) {
    const canvasRef = useRef(null)
    const animationRef = useRef(null)
    const gridHeight = 8
    const gridWidth = 12
    const cellSize = 40 

    useEffect(() => {
        if (!gridData || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const canvasWidth = gridWidth * cellSize // 12 * 40 = 480px
        const canvasHeight = gridHeight * cellSize // 8 * 40 = 320px

        // Ensure canvas dimensions match calculated size
        canvas.width = canvasWidth
        canvas.height = canvasHeight

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            for (let y = 0; y < gridHeight; y++) {
                // Check if row exists
                if (!gridData[y]) continue
                
                for (let x = 0; x < gridWidth; x++) {
                    // Use 0 or 1 to determine color
                    const value = gridData[y][x] || 0
                    
                    if (useHeightBasedColor && value === 1) {
                        // Apply height-based color when the feature is enabled and cell is active
                        ctx.fillStyle = getHeightBasedColor(y, gridHeight)
                    } else {
                        ctx.fillStyle = value === 1 ? '#FFFFFF' : '#000000' // White for 1, black for 0
                    }
                    // Draw directly without flipping
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
                }
            }
        }

        drawGrid()

        // Only request animation frame if needed (e.g., for continuous updates)
        // animationRef.current = requestAnimationFrame(drawGrid)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [gridData])

    // Function to generate color based on height (y-position)
    const getHeightBasedColor = (y, maxHeight) => {
        // Calculate a normalized position (0 to 1) from bottom to top
        const normalizedHeight = 1 - (y / (maxHeight - 1))
        
        // Create a color gradient from blue (bottom) to red (top)
        // Using RGB values directly
        const r = Math.round(normalizedHeight * 255) // Increase red as we go up
        const g = 0 // Keep green at 0 for a pure blue-to-red gradient
        const b = Math.round((1 - normalizedHeight) * 255) // Decrease blue as we go up
        
        return `rgb(${r}, ${g}, ${b})`
    }

    return (
        <canvas
            ref={canvasRef}
            height={gridHeight * cellSize}
            width={gridWidth * cellSize}
            style={{ 
                border: '1px solid #d9d9d9', 
                marginTop: '50px',
            }}
        />
    )
}