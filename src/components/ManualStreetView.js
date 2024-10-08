import React, { useState, useEffect } from 'react';
import countryCapitals from '../Country';
import FeedbackDialog from './FeedbackDialog';
import './ManualStreetView.css';

const MAX_TRIES = 50;

const ManualStreetView = () => {
  const [location, setLocation] = useState(null);
  const [actualCountry, setActualCountry] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const generateRandomCoordinates = () => {
    const lat = Math.random() * 180 - 90;
    const lng = Math.random() * 360 - 180;
    return { lat, lng };
  };

  const fetchCountryFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      const countryComponent = data.results[0]?.address_components?.find(component =>
        component.types.includes('country')
      );
      return countryComponent ? countryComponent.long_name : null;
    } catch (error) {
      console.error('Error fetching country from coordinates:', error);
      return null;
    }
  };

  const updateProgress = (percentage) => {
    setLoadingProgress(percentage);
  };

  const initializeStreetView = async (attempts = 0) => {
    setLoading(true);
    updateProgress(0);

    const randomLocation = generateRandomCoordinates();
    const streetViewService = new window.google.maps.StreetViewService();

    streetViewService.getPanorama(
      { location: randomLocation, radius: 500000 },
      async (result, status) => {
        if (status === 'OK') {
          const panoramaElement = document.getElementById('street-view');
          if (panoramaElement) {
            updateProgress(25); // Update progress after finding the location

            new window.google.maps.StreetViewPanorama(panoramaElement, {
              position: result.location.latLng,
              pov: { heading: 165, pitch: 0 },
              zoom: 1,
              panControl: true,
              zoomControl: true,
              addressControl: false,
              linksControl: true,
              enableCloseButton: false,
              fullscreenControl: false,
            });

            updateProgress(50); // Update progress after initializing the panorama

            const country = await fetchCountryFromCoordinates(result.location.latLng.lat(), result.location.latLng.lng());
            if (country) {
              updateProgress(75); // Update progress after fetching country details

              setLocation(result.location.latLng);
              setActualCountry(country);
              setLoading(false);
              updateProgress(100); // Complete the progress
            } else {
              handleError("Country couldn't be determined");
            }
          } else {
            handleError('Street View element not found');
          }
        } else {
          if (attempts < MAX_TRIES) {
            initializeStreetView(attempts + 1); // Retry with a different random location
          } else {
            handleError('Unable to find a valid Street View location after multiple attempts');
          }
        }
      }
    );
  };

  const handleError = (message) => {
    console.error(message);
    setResult(message);
    setShowDialog(true);
    setLoading(false);
    updateProgress(100); // Ensure progress completes even if there's an error
  };

  useEffect(() => {
    initializeStreetView();
  }, []);

  const handleTryAnother = () => {
    setResult('');
    setGuess('');
    setActualCountry('');
    setIsCorrect(false);
    setShowDialog(false);
    initializeStreetView();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedActualCountry = actualCountry.toLowerCase();
    const guessedCorrectly = normalizedGuess === normalizedActualCountry;
    const isValidCountry = Object.keys(countryCapitals).some(
      country => country.toLowerCase() === normalizedGuess
    );

    let feedbackMessage = '';

    if (guessedCorrectly) {
      feedbackMessage = `🎉 Congratulations! You guessed correctly. The country is ${actualCountry}.`;
      setIsCorrect(true);
    } else if (!isValidCountry) {
      feedbackMessage = `❌ Your guess "${guess}" is incorrect. This is a photo from ${actualCountry ? actualCountry : "an unknown location"}.`;
      setIsCorrect(false);
    } else {
      feedbackMessage = `❌ Your guess is incorrect. The correct answer is ${actualCountry ? actualCountry : "an unknown location"}.`;
      setIsCorrect(false);
    }

    setResult(feedbackMessage);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setResult(''); // Clear the result when dialog is closed
  };

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
      {loading && (
        <div style={{ textAlign: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="loading-bar-container">
            <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          Loading {loadingProgress}%
        </div>
      )}
      <div id="street-view" style={{ width: '100%', height: '80%', display: loading ? 'none' : 'block' }}></div>
      <form onSubmit={handleSubmit} style={{ padding: '20px', textAlign: 'center', display: loading ? 'none' : 'block' }}>
        <label style={{ fontSize: '1.2em', marginRight: '10px' }}>
          Guess the country:
        </label>
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '1em',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            fontSize: '1em',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#28a745',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
        <button
          type="button"
          onClick={handleTryAnother}
          style={{
            padding: '10px 20px',
            fontSize: '1em',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
            marginLeft: '10px',
          }}
        >
          Try Another
        </button>
      </form>

      {showDialog && (
        <FeedbackDialog
          message={result}
          onClose={handleCloseDialog}
          isCorrect={isCorrect}
          isMobile={isMobile}
        />
      )}

      <style>
        {`
          .loading-bar-container {
            width: 80%;
            height: 10px;
            background-color: #f3f3f3;
            margin: 0 auto;
            border-radius: 5px;
            overflow: hidden;
          }

          .loading-bar {
            height: 100%;
            background-color: #09f;
            transition: width 0.3s ease;
          }

          .play-more-button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1.2em;
            border-radius: 5px;
            border: none;
            background-color: #ffc107;
            color: black;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          .play-more-button:hover {
            background-color: #e0a800;
          }
        `}
      </style>
    </div>
  );
};

export default ManualStreetView;
