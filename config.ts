// Konfigurasi Global Aplikasi
// Menggunakan environment variables untuk konfigurasi yang fleksibel

// API Base URL - fallback ke nilai default jika tidak ada env variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000`;

// App Info - dari environment variables
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'CORE.FTI';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '2.0.0';
export const INSTITUTION_NAME = import.meta.env.VITE_INSTITUTION_NAME || 'Fakultas Teknologi Informasi - UKSW';
export const INSTITUTION_URL = import.meta.env.VITE_INSTITUTION_URL || 'https://fti.uksw.edu';
