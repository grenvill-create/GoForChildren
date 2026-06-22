import React from 'react';
import './index.css';
import Board from './components/Board';

function App() {
  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#ff9a9e', fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(255, 154, 158, 0.3)' }}>
          🌸 花仙子的魔法花园 🌸
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#888' }}>快来种下神奇的种子，收集露珠吧！</p>
      </header>
      
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Board />
      </main>
    </div>
  );
}

export default App;
