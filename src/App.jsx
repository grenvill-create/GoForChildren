import React from 'react';
import './index.css';
import Board from './components/Board';

function App() {
  return (
    <div className="app-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        background: 'rgba(255, 255, 255, 0.4)', 
        backdropFilter: 'blur(8px)', 
        padding: '15px 40px', 
        borderRadius: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#ff7b89', fontSize: '2.8rem', textShadow: '0 2px 10px rgba(255, 255, 255, 0.8)', margin: '0 0 10px 0' }}>
          🌸 花仙子的魔法花园 🌸
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#555', fontWeight: 'bold', margin: '0' }}>
          快来种下神奇的种子，收集魔法露珠吧！
        </p>
      </header>
      
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Board />
      </main>
    </div>
  );
}

export default App;
