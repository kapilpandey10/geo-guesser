import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import RotateScreenDialog from './components/RotateScreenDialog';
import Welcome from './components/Welcome';
import ManualStreetView from './components/ManualStreetView'; // Corrected import

function App() {
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      setShowDialog(true);
    }
  }, []);

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  return (
    <Router>
      {showDialog && <RotateScreenDialog onClose={handleCloseDialog} />}
      
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/game" element={<ManualStreetView />} /> {/* Add route for ManualStreetView */}
      </Routes>
    </Router>
  );
}

export default App;
