import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'

// Set the base URL for production deployments (e.g., Render)
// In development, this stays empty and uses the Vite proxy
axios.defaults.baseURL = import.meta.env.PROD
  ? 'https://your-backend-url.onrender.com' // TODO: Replace this with your actual deployed backend URL!
  : '';

// Ensure cookies (like the session ID) are sent with every request, even cross-origin
axios.defaults.withCredentials = true;

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
