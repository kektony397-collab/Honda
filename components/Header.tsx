import React from 'react';

interface HeaderProps {
  isRecording: boolean;
}

const Header: React.FC<HeaderProps> = ({ isRecording }) => {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Bike GPS Dashboard</h1>
        <p className="text-sm text-gray-400">Honda Dream Yug Edition</p>
      </div>
      <div className="text-sm text-gray-300 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700 flex items-center shadow-lg">
        Status:
        <span className={`ml-2 font-medium flex items-center gap-2 ${isRecording ? 'text-green-400' : 'text-red-400'}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          {isRecording ? 'Recording' : 'Idle'}
        </span>
      </div>
    </header>
  );
};

export default Header;