// src/components/Map.js

import React, { useState, useEffect } from 'react';
import { useLoadScript, StreetViewPanorama } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRadians = (degree) => degree * (Math.PI / 180);

  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};

const Map = () => {
  const [location, setLocation] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const loadKnownLocation = () => {
    // Set a known location that has Street View coverage
    setLocation({ lat: 40.748817, lng: -73.985428 }); // Empire State Building
  };

  useEffect(() => {
    if (location) {
      const distanceToTehran = calculateDistance(location.lat, location.lng, 35.6892, 51.3890); // Tehran, Iran
      console.log(`Distance from the current location to Tehran: ${distanceToTehran.toFixed(2)} km`);
    }
  }, [location]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <button onClick={loadKnownLocation} style={{ margin: '20px', padding: '10px 20px' }}>
        Load Known Location
      </button>
      {location && (
        <StreetViewPanorama
          position={location}
          visible={true}
          options={{
            pov: { heading: 100, pitch: 0 },
            zoom: 1,
          }}
          style={mapContainerStyle}
        />
      )}
    </div>
  );
};

export default Map;
