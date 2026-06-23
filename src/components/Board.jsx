import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import './Board.css';
import happyImg from '../assets/happy.png';
import sweatyImg from '../assets/sweaty.png';
import glowImg from '../assets/glow.png';
import dewdropImg from '../assets/dewdrop.png';
import bugImg from '../assets/bug.png'; // newly generated bug asset

// Level Configurations
const LEVELS = {
  1: {
    title: '第一关：播种神奇种子',
    getInitialGrid: () => Array(25).fill(null),
    targetTiles: [6, 8, 12, 16, 18], 
    winType: 'single', 
    itemToPlace: 'pink', 
    initialMessage: '把魔法种子种在闪闪发光的星星上吧！',
    successMessage: '太棒啦！种子成功种下，魔法花朵开始发芽了！'
  },
  2: {
    title: '第二关：花苞口渴了',
    getInitialGrid: () => {
      const grid = Array(25).fill(null);
      grid[12] = 'pink'; 
      return grid;
    },
    targetTiles: [7, 11, 13, 17], 
    winType: 'all', 
    itemToPlace: 'dewdrop', 
    initialMessage: '花苞口渴了，把魔法露珠放在它四周（气）的光圈上吧！',
    successMessage: '咕噜咕噜~ 花苞喝饱了水，开心地笑啦！'
  },
  3: {
    title: '第三关：抓住贪吃虫',
    getInitialGrid: () => {
      const grid = Array(25).fill(null);
      grid[12] = 'bug'; 
      return grid;
    },
    targetTiles: [7, 11, 13, 17], 
    winType: 'capture_bug', 
    itemToPlace: 'dewdrop', 
    initialMessage: '第三关：调皮的贪吃虫来了！快用露珠包围它所有的路口！',
    successMessage: '哇哦！贪吃虫被净化成魔法粉尘啦！太厉害了！'
  }
};

// Generic Liberty Calculation Algorithm
const getAdjacentIndices = (index, size) => {
  const adj = [];
  const row = Math.floor(index / size);
  const col = index % size;
  if (row > 0) adj.push(index - size);
  if (row < size - 1) adj.push(index + size);
  if (col > 0) adj.push(index - 1);
  if (col < size - 1) adj.push(index + 1);
  return adj;
};

const calculateGroupLiberties = (currentGrid, startIndex, size) => {
  const color = currentGrid[startIndex];
  if (!color) return { liberties: 0, group: [] };

  const group = new Set();
  const liberties = new Set();
  const queue = [startIndex];

  while (queue.length > 0) {
    const current = queue.shift();
    if (group.has(current)) continue;
    group.add(current);

    const adj = getAdjacentIndices(current, size);
    for (const neighbor of adj) {
      const neighborColor = currentGrid[neighbor];
      if (neighborColor === null) {
        liberties.add(neighbor);
      } else if (neighborColor === color) {
        if (!group.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  return { liberties: liberties.size, group: Array.from(group) };
};

// FlowerBud component handles all entities
const FlowerBud = ({ type, isError, captured }) => {
  const isPink = type === 'pink' || isError;
  const isDewdrop = type === 'dewdrop';
  const isBug = type === 'bug';
  
  let classes = `flower-bud ${isPink ? 'bud-pink' : 'bud-white'}`;
  if (isError) classes += ' bud-error';
  if (captured) classes += ' bud-captured'; // For capture animation
  
  let imgSrc = happyImg;
  if (isError) imgSrc = sweatyImg;
  if (isDewdrop) imgSrc = dewdropImg;
  if (isBug) imgSrc = bugImg;
  
  return (
    <div className={classes}>
      <img 
        src={imgSrc} 
        alt="Sprite" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover', 
          borderRadius: '50%',
          boxShadow: isDewdrop ? '0 0 15px rgba(139, 233, 253, 0.8)' : '0 6px 12px rgba(0,0,0,0.3)',
          transform: isDewdrop ? 'scale(0.8)' : 'scale(1.2)'
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
  const [capturedTiles, setCapturedTiles] = useState([]);
  const [message, setMessage] = useState('');

  // Setup level
  useEffect(() => {
    const levelConfig = LEVELS[currentLevelNum];
    setGrid(levelConfig.getInitialGrid());
    setLevelComplete(false);
    setCapturedTiles([]);
    setMessage(levelConfig.initialMessage);
  }, [currentLevelNum]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#ffb7b2', '#8be9fd', '#dcedc1', '#ffffff']
    });
  };

  const handleTileClick = (index) => {
    if (levelComplete) return; 
    if (grid[index]) return;   
    if (errorTile !== null) return; 
    if (capturedTiles.length > 0) return; // wait for capture animation
    
    const levelConfig = LEVELS[currentLevelNum];
    
    // In Level 3, the player places dewdrops to capture the bug
    if (levelConfig.targetTiles.includes(index)) {
      const newGrid = [...grid];
      newGrid[index] = levelConfig.itemToPlace;
      
      let won = false;
      let newlyCaptured = [];

      // If win condition is capturing the bug, calculate liberties!
      if (levelConfig.winType === 'capture_bug') {
        // Find all bugs and check their liberties
        for (let i = 0; i < newGrid.length; i++) {
          if (newGrid[i] === 'bug') {
            const result = calculateGroupLiberties(newGrid, i, size);
            if (result.liberties === 0) {
              // Captured!
              newlyCaptured = newlyCaptured.concat(result.group);
            }
          }
        }
        
        if (newlyCaptured.length > 0) {
          setCapturedTiles(newlyCaptured);
          // After 0.8s animation, clear the bugs and win
          setTimeout(() => {
            const finalGrid = [...newGrid];
            newlyCaptured.forEach(ci => finalGrid[ci] = null);
            setGrid(finalGrid);
            setCapturedTiles([]);
            setLevelComplete(true);
            setMessage(levelConfig.successMessage);
            triggerConfetti();
          }, 800);
        } else {
           // Calculate how many liberties the bug still has
           const bugLiberties = calculateGroupLiberties(newGrid, 12, size).liberties; // 12 is the center bug
           setMessage(`加油！贪吃虫还剩 ${bugLiberties} 个方向可以逃跑！`);
        }
        
        // We set the grid immediately so the dewdrop appears
        setGrid(newGrid);
        return;
      }
      
      // Standard win condition logic (Level 1 and 2)
      setGrid(newGrid);
      
      if (levelConfig.winType === 'single') {
        won = true;
      } else if (levelConfig.winType === 'all') {
        let placedCount = 0;
        levelConfig.targetTiles.forEach(i => {
          if (newGrid[i] === levelConfig.itemToPlace) placedCount++;
        });
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
      // Wrong Move
      setErrorTile(index);
      setMessage(levelConfig.winType === 'capture_bug' ? '贪吃虫不在这里哦，快堵住它发光的路口！' : '哎呀，放错地方了！');
      
      setTimeout(() => {
        setErrorTile(null);
        let resetMsg = levelConfig.initialMessage;
        
        if (levelConfig.winType === 'all') {
          let placedCount = 0;
          grid.forEach((cell, i) => {
             if (levelConfig.targetTiles.includes(i) && cell === levelConfig.itemToPlace) placedCount++;
          });
          if (placedCount > 0) {
            resetMsg = `继续努力，还差 ${levelConfig.targetTiles.length - placedCount} 颗露珠！`;
          }
        } else if (levelConfig.winType === 'capture_bug') {
           const bugLiberties = calculateGroupLiberties(grid, 12, size).liberties;
           if (bugLiberties < 4) resetMsg = `加油！贪吃虫还剩 ${bugLiberties} 个方向可以逃跑！`;
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
            const isTarget = levelConfig && levelConfig.targetTiles.includes(index) && !levelComplete && cell !== levelConfig.itemToPlace;
            const isError = errorTile === index;
            const isCaptured = capturedTiles.includes(index);
            
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
                  {isTarget && !cell && <img src={glowImg} alt="glow target" className="highlight-star" style={{ width: '50px', height: '50px', mixBlendMode: 'screen' }} />}
                </div>
                
                {/* Render entity */}
                {(cell || isError) && <FlowerBud type={cell || levelConfig.itemToPlace} isError={isError} captured={isCaptured} />}
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
            if (currentLevelNum < 3) {
              setCurrentLevelNum(currentLevelNum + 1);
            } else {
              setCurrentLevelNum(1); // loop back
            }
          }}
        >
          {currentLevelNum < 3 ? '👉 进入下一关！' : '🔁 从头再玩！'}
        </button>
      )}

    </div>
  );
};

export default Board;
