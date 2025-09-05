import React from 'react';

// A private, reusable Button component for this control panel
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}
const Button: React.FC<ButtonProps> = ({ children, variant = 'secondary', className, ...props }) => {
  const baseClasses = 'px-5 py-2.5 rounded-full font-semibold text-sm shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';
  const variantClasses = {
    primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    secondary: 'bg-gray-700 border border-gray-600 text-gray-200 hover:bg-gray-600 focus:ring-red-500',
    danger: 'bg-red-900/50 text-red-300 border border-red-700 hover:bg-red-800/50 focus:ring-red-500',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface ControlsProps {
  isRecording: boolean;
  hasPoints: boolean;
  onStart: () => void;
  onStop: () => void;
  onSave: () => void;
  onClear: () => void;
  onRequestNotifications: () => void;
}

const Controls: React.FC<ControlsProps> = ({ isRecording, hasPoints, onStart, onStop, onSave, onClear, onRequestNotifications }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-700">
       <div className="flex flex-wrap gap-3 items-center">
        {!isRecording ? (
          <Button onClick={onStart} variant="primary">Start Ride</Button>
        ) : (
          <Button onClick={onStop} className="bg-red-700 hover:bg-red-800 focus:ring-red-600 text-white animate-pulse">End Ride</Button>
        )}
        <Button onClick={onSave} disabled={!hasPoints || isRecording}>Save Session</Button>
        <Button onClick={onRequestNotifications}>Enable Notifications</Button>
        <Button onClick={onClear} variant="danger" disabled={!hasPoints || isRecording}>Clear Temp</Button>
      </div>
    </div>
  );
};

export default Controls;