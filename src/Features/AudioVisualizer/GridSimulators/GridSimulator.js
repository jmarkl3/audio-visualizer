import React, { useRef, useEffect } from 'react'

export default function GridSimulator({ gridData }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!gridData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const gridSize = 16;
        const cellSize = canvas.width / gridSize;

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let x = 0; x < gridSize; x++) {
                // Check if row exists
                if (!gridData[x]) continue;
                
                for (let y = 0; y < gridSize; y++) {
                    // Check if cell exists and has color data
                    const color = gridData[x][y] || { r: 0, g: 0, b: 0 };
                    ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        };

        drawGrid();
        
        animationRef.current = requestAnimationFrame(drawGrid);

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [gridData]);

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