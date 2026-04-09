import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX, ArrowLeft, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in-up">
      <div className="relative mb-6">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-yellow-100 dark:bg-yellow-900/30 rounded-full animate-pulse"></div>
        
        {/* Main Icon */}
        <div className="relative bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg border-2 border-yellow-100 dark:border-yellow-900">
          <SearchX className="w-16 h-16 text-yellow-500 dark:text-yellow-400" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Halaman Tidak Ditemukan</h2>
      
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Maaf, halaman yang Anda cari tidak dapat ditemukan. URL mungkin salah atau halaman telah dipindahkan.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <Home className="w-4 h-4 mr-2" />
          Ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;