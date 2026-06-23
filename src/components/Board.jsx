import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import './Board.css';

// FlowerBud component (The "Stones")
const FlowerBud = ({ type, isError }) => {
  // type can be 'pink', 'white', or 'error' (which renders as a sweat pink bud)
  const isPink = type === 'pink' || isError;
  const classes = `flower-bud ${isPink ? 'bud-pink' : 'bud-white'} ${isError ? 'bud-error' : ''}`;
  
  return (
    <div className={classes}>
      <div className="bud-face">
        {isError ? (
          <>
            <div className="eye left" style={{ borderRadius: '0', height: '2px', top: '35%' }}></div>
            <div className="eye right" style={{ borderRadius: '0', height: '2px', top: '35%' }}></div>
            <div className="mouth" style={{ borderBottomColor: 'transparent', borderTopColor: '#555', top: '55%', bottom: 'auto' }}></div>
            {/* Sweat drop */}
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '6px', height: '10px', background: '#8be9fd', borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}></div>
          </>
        ) : (
          <>
            <div className="eye left"></div>
            <div className="eye right"></div>
            <div className="mouth"></div>
          </>
        )}
      </div>
    </div>
  );
};

// Board Component
const Board = () => {
  const size = 5;
  const [grid, setGrid] = useState(Array(size * size).fill(null));
  
  // Level 1 logic states
  const [levelComplete, setLevelComplete] = useState(false);
  const [errorTile, setErrorTile] = useState(null);
  const [message, setMessage] = useState('把魔法种子种在闪闪发光的十字路口吧！');

  // For level 1, only these intersections are targets
  const targetTiles = [6, 8, 12, 16, 18];

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffb7b2', '#8be9fd', '#dcedc1', '#ffffff']
    });
  };

  const handleTileClick = (index) => {
    if (levelComplete) return; // Ignore if level is already won
    if (grid[index]) return;   // Already occupied
    if (errorTile !== null) return; // Wait for current error animation to finish
    
    if (targetTiles.includes(index)) {
      // Correct!
      const newGrid = [...grid];
      newGrid[index] = 'pink';
      setGrid(newGrid);
      setLevelComplete(true);
      setMessage('太棒啦！种子成功种下，魔法花朵开始发芽了！');
      triggerConfetti();
    } else {
      // Wrong! Show error bounce
      setErrorTile(index);
      setMessage('哎呀，这里没有发光哦，种子会滑倒的，换个地方吧~');
      
      // Remove the error bud after animation (0.8s)
      setTimeout(() => {
        setErrorTile(null);
        setMessage('把魔法种子种在闪闪发光的十字路口吧！');
      }, 800);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Friendly Guide Message */}
      <div style={{
        marginBottom: '20px',
        padding: '15px 25px',
        backgroundColor: '#fff',
        borderRadius: '25px',
        boxShadow: '0 4px 15px rgba(255, 183, 178, 0.3)',
        color: '#ff7b89',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s'
      }}>
        ✨ {message}
      </div>

      <div className="board-container">
        <div className="trellis-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {grid.map((cell, index) => {
            const isTarget = targetTiles.includes(index) && !levelComplete;
            const isError = errorTile === index;
            
            return (
              <div 
                key={index} 
                className="trellis-tile"
                onClick={() => handleTileClick(index)}
              >
                <div className="line-h"></div>
                <div className="line-v"></div>
                
                <div className="hitbox">
                  {/* Glowing targets */}
                  {isTarget && !cell && <div className="highlight-star">✨</div>}
                </div>
                
                {/* Render bud if it's placed permanently OR temporarily due to error */}
                {(cell || isError) && <FlowerBud type={cell || 'pink'} isError={isError} />}
              </div>
            );
          })}
        </div>
      </div>

      {levelComplete && (
        <button 
          style={{ marginTop: '30px', padding: '12px 30px', fontSize: '1.5rem', background: '#ffdac1', color: '#ff7b89', fontWeight: 'bold' }}
          onClick={() => window.location.reload()}
        >
          再玩一次 🌸
        </button>
      )}

    </div>
  );
};

export default Board;
