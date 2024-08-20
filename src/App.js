// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Welcome from './components/Welcome';
import Map from './components/ManualStreetView'; // Import the Map component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/game" element={<Map />} /> {/* Updated to use Map component */}
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
