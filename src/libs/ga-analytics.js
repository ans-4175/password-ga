import ReactGA from 'react-ga4';

const TRACKING_ID = 'G-SDBSSSN65X';

export function init() {
  // Enable testMode on local or development environment
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
  ReactGA.initialize(TRACKING_ID, { testMode: isDev });
}

export function sendEvent(payload) {
  ReactGA.event({ ...payload, nonInteraction: false });
}

export function sendPageview(path) {
  ReactGA.send({ hitType: 'pageview', page: path });
}