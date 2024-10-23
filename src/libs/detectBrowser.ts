export const detectBrowser = (): browsersName => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome') && !userAgent.includes('opera') && !userAgent.includes('opr')) {
    return 'chrome'; // Incluye Chrome, Edge, Brave
  } else if (userAgent.includes('firefox')) {
    return 'firefox';
  } else {
    return 'other';
  }
};
