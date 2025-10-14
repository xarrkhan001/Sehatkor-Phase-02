import React from 'react';
import { Loader2 } from 'lucide-react';

interface FullScreenLoaderProps {
  isVisible: boolean;
  message?: string;
}

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ 
  isVisible, 
  message = "Processing..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Loader content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center space-y-4">
          {/* Animated loader */}
          <div className="relative">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse" />
          </div>
          
          {/* Loading message */}
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 mb-1">{message}</p>
            <p className="text-sm text-gray-600">Please wait while we process your request...</p>
          </div>
          
          {/* Loading dots animation */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;
