import { useState } from 'react';

export default function useGeolocation() {
  const [error, setError] = useState('');

  function locate() {
    setError('');
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser.');
      return Promise.reject(new Error('Location is not supported by this browser.'));
    }
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
        () => {
          const message = 'Could not access your location. You can enter coordinates manually.';
          setError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    });
  }

  return { locate, error, setError };
}
