import React from 'react';
import ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import App from './App';
import './index.css';

// Detect if device is mobile
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  navigator.userAgent
);

// Use TouchBackend for mobile, HTML5Backend for desktop
const Backend = isMobile ? TouchBackend : HTML5Backend;

ReactDOM.render(
  <React.StrictMode>
    <DndProvider backend={Backend}>
      <App />
    </DndProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

