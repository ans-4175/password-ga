import React from 'react';
import { useLocation } from 'react-router-dom';

const { init, sendPageview } = require('./ga-analytics');

export default function useGoogleAnalytics() {
  const location = useLocation();

  React.useEffect(() => {
    init();
  }, []);

  React.useEffect(() => {
    const currentPath = location.pathname + location.search;
    sendPageview(currentPath);
  }, [location]);
}
