export const detectBrowser = (): browsersName => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome')) {
    return 'chrome'; // Incluye Chrome, Edge, Brave
  } else if (userAgent.includes('firefox')) {
    return 'firefox';
  } else {
    return 'other';
  }
};
