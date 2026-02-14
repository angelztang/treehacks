// Use environment variable for API URL when available (useful for local dev).
// In production builds you can set REACT_APP_API_URL to your production backend.
export const API_URL = (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL !== '')
	? process.env.REACT_APP_API_URL
	: 'http://localhost:8000';

export const CAS_URL = 'https://fed.princeton.edu/cas';
export const FRONTEND_URL = (process.env.REACT_APP_FRONTEND_URL && process.env.REACT_APP_FRONTEND_URL !== '')
	? process.env.REACT_APP_FRONTEND_URL
	: 'http://localhost:3000';