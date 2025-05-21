const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://tutti-production.up.railway.app';

export { API_BASE_URL };