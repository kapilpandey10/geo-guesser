import React from 'react';
import { GoogleMap, useLoadScript, StreetViewPanorama } from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};

const Map = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={{ lat: 40.748817, lng: -73.985428 }} // Example coordinates (Empire State Building)
      zoom={12}
    >
      <StreetViewPanorama
        position={{ lat: 40.748817, lng: -73.985428 }}
        visible={true}
        options={{ pov: { heading: 100, pitch: 0 }, zoom: 1 }}
      />
    </GoogleMap>
  );
};

export default Map;
