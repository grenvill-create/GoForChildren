import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './Board.css';
import happyImg from '../assets/happy.png';
import sweatyImg from '../assets/sweaty.png';
import glowImg from '../assets/glow.png';
import dewdropImg from '../assets/dewdrop.png'; // newly generated dewdrop asset

// Level Configurations
const LEVELS = {
  1: {
    title: '第一关：播种神奇种子',
    getInitialGrid: () => Array(25).fill(null),
    targetTiles: [6, 8, 12, 16, 18], // Placed some choices
    winType: 'single', // Win by hitting any single target
    itemToPlace: 'pink', // Places a flower bud
    initialMessage: '把魔法种子种在闪闪发光的星星上吧！',
    successMessage: '太棒啦！种子成功种下，魔法花朵开始发芽了！'
  },
  2: {
    title: '第二关：花苞口渴了',
    getInitialGrid: () => {
      const grid = Array(25).fill(null);
      grid[12] = 'pink'; // Pre-plant a flower bud in the center
      return grid;
    },
    targetTiles: [7, 11, 13, 17], // Up, Left, Right, Bottom relative to 12
    winType: 'all', // Win by hitting ALL targets
    itemToPlace: 'dewdrop', // Places a water dewdrop
    initialMessage: '花苞口渴了，把魔法露珠放在它四周（气）的光圈上吧！',
    successMessage: '咕噜咕噜~ 花苞喝饱了水，开心地笑啦！'
  }
};

// FlowerBud component handles all entities on the board (Stones/Dewdrops)
const FlowerBud = ({ type, isError }) => {
  const isPink = type === 'pink' || isError;
  const isDewdrop = type === 'dewdrop';
  
  const classes = `flower-bud ${isPink ? 'bud-pink' : 'bud-white'} ${isError ? 'bud-error' : ''}`;
  
  let imgSrc = happyImg;
  if (isError) imgSrc = sweatyImg;
  if (isDewdrop) imgSrc = dewdropImg;
  
  return (
    <div className={classes}>
      <img 
        src={imgSrc} 
        alt="Sprite" 
        style={{ 
          width: isDewdrop ? '80%' : '130%', // Dewdrops are slightly smaller
          height: isDewdrop ? '80%' : '130%', 
          objectFit: 'contain', 
          filter: isDewdrop ? 'drop-shadow(0 0 10px rgba(139, 233, 253, 0.8))' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' 
        }} 
      />
    </div>
  );
};

// Board Component
const Board = () => {
  const size = 5;
  
  const [currentLevelNum, setCurrentLevelNum] = useState(1);
  const [grid, setGrid] = useState([]);
  
  const [levelComplete, setLevelComplete] = useState(false);
  const [errorTile, setErrorTile] = useState(null);
  const [message, setMessage] = useState('');

  // Setup level state when level changes
  useEffect(() => {
    const levelConfig = LEVELS[currentLevelNum];
    setGrid(levelConfig.getInitialGrid());
    setLevelComplete(false);
    setMessage(levelConfig.initialMessage);
  }, [currentLevelNum]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffb7b2', '#8be9fd', '#dcedc1', '#ffffff']
    });
  };

  const handleTileClick = (index) => {
    if (levelComplete) return; 
    if (grid[index]) return;   
    if (errorTile !== null) return; 
    
    const levelConfig = LEVELS[currentLevelNum];
    
    if (levelConfig.targetTiles.includes(index)) {
      // Correct Move!
      const newGrid = [...grid];
      newGrid[index] = levelConfig.itemToPlace;
      setGrid(newGrid);
      
      // Check Win Condition
      let won = false;
      if (levelConfig.winType === 'single') {
        won = true;
      } else if (levelConfig.winType === 'all') {
        // Count how many items of `itemToPlace` are on target tiles
        let placedCount = 0;
        levelConfig.targetTiles.forEach(i => {
          if (newGrid[i] === levelConfig.itemToPlace) placedCount++;
        });
        
        // Count just placed one, so it must equal length
        if (placedCount === levelConfig.targetTiles.length) {
          won = true;
        } else {
          setMessage(`太棒了！还差 ${levelConfig.targetTiles.length - placedCount} 颗露珠！`);
        }
      }
      
      if (won) {
        setLevelComplete(true);
        setMessage(levelConfig.successMessage);
        triggerConfetti();
      }
      
    } else {
      // Wrong Move! Show error bounce
      setErrorTile(index);
      setMessage('哎呀，放错地方了！小精灵接不到魔法哦~');
      
      setTimeout(() => {
        setErrorTile(null);
        // Reset to initial message, unless they made partial progress in an 'all' level
        let resetMsg = levelConfig.initialMessage;
        if (levelConfig.winType === 'all') {
          let placedCount = 0;
          grid.forEach((cell, i) => {
             if (levelConfig.targetTiles.includes(i) && cell === levelConfig.itemToPlace) placedCount++;
          });
          if (placedCount > 0) {
            resetMsg = `继续努力，还差 ${levelConfig.targetTiles.length - placedCount} 颗露珠！`;
          }
        }
        setMessage(resetMsg);
      }, 800);
    }
  };

  const levelConfig = LEVELS[currentLevelNum];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Friendly Guide Message */}
      <div style={{
        marginBottom: '20px',
        padding: '15px 25px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(5px)',
        borderRadius: '25px',
        boxShadow: '0 4px 15px rgba(255, 183, 178, 0.4)',
        color: '#ff7b89',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        textAlign: 'center',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s',
        border: '2px solid rgba(255, 255, 255, 0.9)'
      }}>
        ✨ {message}
      </div>

      <div className="board-container">
        <div className="trellis-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {grid.map((cell, index) => {
            // A tile is a target if it's in targetTiles and doesn't currently hold the correct item
            const isTarget = levelConfig && levelConfig.targetTiles.includes(index) && !levelComplete && cell !== levelConfig.itemToPlace;
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
                  {isTarget && !cell && <img src={glowImg} alt="glow target" className="highlight-star" style={{ width: '50px', height: '50px' }} />}
                </div>
                
                {/* Render bud/dewdrop if it's placed permanently OR temporarily due to error */}
                {(cell || isError) && <FlowerBud type={cell || 'pink'} isError={isError} />}
              </div>
            );
          })}
        </div>
      </div>

      {levelComplete && (
        <button 
          style={{ 
            marginTop: '30px', 
            padding: '15px 40px', 
            fontSize: '1.5rem', 
            background: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', 
            color: '#fff', 
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '50px',
            boxShadow: '0 5px 15px rgba(255, 154, 158, 0.5)',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          onClick={() => {
            if (currentLevelNum === 1) {
              setCurrentLevelNum(2);
            } else {
              // Loop back to level 1 for now if we don't have level 3 yet
              setCurrentLevelNum(1);
            }
          }}
        >
          {currentLevelNum === 1 ? '👉 进入第二关！' : '🔁 再玩一次！'}
        </button>
      )}

    </div>
  );
};

export default Board;
