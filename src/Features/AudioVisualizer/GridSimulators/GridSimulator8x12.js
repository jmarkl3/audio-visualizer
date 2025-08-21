import React, { useRef, useEffect } from 'react';

export default function GridSimulator8x12({ gridData }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!gridData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const gridHeight = 8;
        const gridWidth = 12;
        const cellSize = 40; // Square cells: 40px x 40px
        const canvasWidth = gridWidth * cellSize; // 12 * 40 = 480px
        const canvasHeight = gridHeight * cellSize; // 8 * 40 = 320px

        // Ensure canvas dimensions match calculated size
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let x = 0; x < gridWidth; x++) {
                // Check if column exists
                if (!gridData[x]) continue;
                
                for (let y = 0; y < gridHeight; y++) {
                    // Use 0 or 1 to determine color
                    const value = gridData[x][y] || 0;
                    ctx.fillStyle = value === 1 ? '#FFFFFF' : '#000000'; // White for 1, black for 0
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        };

        drawGrid();

        // Only request animation frame if needed (e.g., for continuous updates)
        // animationRef.current = requestAnimationFrame(drawGrid);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gridData]);

    return (
        <canvas
            ref={canvasRef}
            width={480} // 12 * 40px
            height={320} // 8 * 40px
            style={{ 
                border: '1px solid #d9d9d9', 
                marginTop: '50px',
            }}
        />
    );
}