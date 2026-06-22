import React, { useState } from 'react';
import './Board.css';

// FlowerBud component (The "Stones")
const FlowerBud = ({ type }) => {
  // type can be 'pink' (black stone) or 'white' (white stone)
  const isPink = type === 'pink';
  
  return (
    <div className={`flower-bud ${isPink ? 'bud-pink' : 'bud-white'}`}>
      <div className="bud-face">
        <div className="eye left"></div>
        <div className="eye right"></div>
        <div className="mouth"></div>
      </div>
    </div>
  );
};

// Board Component
const Board = () => {
  const size = 5;
  // Initialize 5x5 board state
  const [grid, setGrid] = useState(Array(size * size).fill(null));

  const handleTileClick = (index) => {
    // Basic interaction: place a pink bud on empty tiles
    if (grid[index]) return; // Already occupied
    
    const newGrid = [...grid];
    newGrid[index] = 'pink';
    setGrid(newGrid);
    
    // Play a happy sound here eventually
  };

  return (
    <div className="board-container">
      <div className="trellis-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
        {grid.map((cell, index) => (
          <div 
            key={index} 
            className="trellis-tile"
            onClick={() => handleTileClick(index)}
          >
            {/* The vertical and horizontal lines of the trellis */}
            <div className="line-h"></div>
            <div className="line-v"></div>
            
            {/* The intersection target area (hitbox) */}
            <div className="hitbox">
              {/* Highlight for the tutorial (only on empty tiles) */}
              {!cell && <div className="highlight-star">✨</div>}
            </div>
            
            {/* Render the flower bud if it exists on this tile */}
            {cell && <FlowerBud type={cell} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
