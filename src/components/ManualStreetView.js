import React, { useEffect, useState } from 'react';
import { getDistance } from 'geolib';
import countryCapitals from '../Country';
import './ManualStreetView.css';

const ManualStreetView = () => {
  const [location, setLocation] = useState(null);
  const [actualCountry, setActualCountry] = useState('');
  const [guess, setGuess] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);

  const MAX_TRIES = 10;

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

  const initializeStreetView = (location, attempts = 0) => {
    const streetViewService = new window.google.maps.StreetViewService();
    streetViewService.getPanorama(
      { location, radius: 50000 },
      async (result, status) => {
        if (status === 'OK') {
          const panorama = new window.google.maps.StreetViewPanorama(
            document.getElementById('street-view'),
            {
              position: result.location.latLng,
              pov: { heading: 165, pitch: 0 },
              zoom: 1,
              panControl: true,
              zoomControl: true,
              addressControl: false,
              linksControl: true,
              enableCloseButton: false,
              fullscreenControl: false,
            }
          );

          window.google.maps.event.addListenerOnce(panorama, 'status_changed', async () => {
            if (panorama.getStatus() === 'OK') {
              const country = await fetchCountryFromCoordinates(result.location.latLng.lat(), result.location.latLng.lng());
              if (country) {
                setLocation(result.location.latLng);
                setActualCountry(country);
              }
            } else {
              if (attempts < MAX_TRIES) {
                fetchAndInitialize(attempts + 1);
              } else {
                setError('Unable to find a valid Street View location. Please try again.');
              }
            }
          });
        } else {
          if (attempts < MAX_TRIES) {
            fetchAndInitialize(attempts + 1);
          } else {
            setError('Unable to find a valid Street View location. Please try again.');
          }
        }
      }
    );
  };

  const fetchAndInitialize = async (attempts = 0) => {
    setLoading(true);
    const randomLocation = generateRandomCoordinates();
    initializeStreetView(randomLocation, attempts);
    setLoading(false);
  };

  useEffect(() => {
    fetchAndInitialize();
  }, []);

  const handleTryAnother = () => {
    setError('');
    setResult('');
    setGuess('');
    setActualCountry('');
    setFeedback('');
    setIsCorrect(false);
    fetchAndInitialize();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedActualCountry = actualCountry.toLowerCase();
    const guessedCorrectly = normalizedGuess === normalizedActualCountry;
    const isValidCountry = Object.keys(countryCapitals).some(
      country => country.toLowerCase() === normalizedGuess
    );
  
    if (guessedCorrectly) {
      setFeedback('correct');
      setIsCorrect(true);
      setResult(`🎉 Congratulations! You guessed correctly. The country is ${actualCountry}.`);
    } else if (!isValidCountry) {
      setFeedback('invalid');
      setResult(`❌ Your guess "${guess}" is incorrect. This is a photo from ${actualCountry}.`);
    } else {
      const guessedCountryCoords = countryCapitals[Object.keys(countryCapitals).find(
        country => country.toLowerCase() === normalizedGuess
      )];
      const actualCountryCoords = countryCapitals[actualCountry];
  
      if (guessedCountryCoords && actualCountryCoords) {
        try {
          const distance = getDistance(
            { latitude: guessedCountryCoords.lat, longitude: guessedCountryCoords.lng },
            { latitude: actualCountryCoords.lat, longitude: actualCountryCoords.lng }
          );
  
          let feedbackMessage;
          if (distance / 1000 <= 500) {
            feedbackMessage = `✨ Wow, Almost close! Your guess is only ${Math.round(distance / 1000)} km away from ${actualCountry} 😮.`;
          } else if (distance / 1000 <= 1000) {
            feedbackMessage = `Not too far! Your guess is ${Math.round(distance / 1000)} km away from ${actualCountry}. 🗺️`;
          } else {
            feedbackMessage = `Your guess is ${Math.round(distance / 1000)} km away from the actual location in ${actualCountry}. 😔`;
          }
          setFeedback('far');
          setResult(feedbackMessage);
        } catch (error) {
          console.error('Error calculating distance:', error);
          setFeedback('unknown');
          setResult(`❓ Could not calculate the distance. Your guess "${guess}" might be ${guessedCorrectly ? 'correct' : `incorrect. The correct answer is ${actualCountry}`}.`);
        }
      } else {
        setFeedback('unknown');
        setResult(`❓ Could not calculate the distance. Your guess "${guess}" might ${guessedCorrectly ? 'correct' : `incorrect. This is not countable, Location not identified.`}.`);
      }
    }
  };
  

  return (
    <div style={{ position: 'relative', height: '100vh', overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
      {loading && <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading...</div>}
      {!loading && !error && <div id="street-view" style={{ width: '100%', height: '80%' }}></div>}
      {error && (
        <div style={{ textAlign: 'center', color: 'red', marginTop: '20px' }}>{error}</div>
      )}
      <form onSubmit={handleSubmit} style={{ padding: '20px', textAlign: 'center' }}>
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
      {result && (
        <div
          style={{
            textAlign: 'center',
            marginTop: '10px',
            padding: '20px',
            fontSize: '1.5em',
            color: feedback === 'correct' ? '#28a745' : feedback === 'far' ? '#dc3545' : feedback === 'invalid' ? '#ffc107' : '#000',
            backgroundColor: feedback === 'correct' ? '#d4edda' : feedback === 'far' ? '#f8d7da' : feedback === 'invalid' ? '#fff3cd' : '#f8f9fa',
            borderRadius: '10px',
            animation: 'fadeIn 1s',
          }}
        >
          {result}
        </div>
      )}
      {isCorrect && (
        <div className="congratulations-overlay">
          <h1>Congratulations!</h1>
          <div className="stars">
            {Array.from({ length: 10 }).map((_, index) => (
              <span key={index} className="star">⭐</span>
            ))}
          </div>
          <button
            onClick={handleTryAnother}
            className="play-more-button"
          >
            Play More
          </button>
        </div>
      )}      <style>
      {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

