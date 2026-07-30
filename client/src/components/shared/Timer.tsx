import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface TimerProps {
  onStop: (durationSeconds: number) => void;
  isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ onStop, isActive }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isActive]);

  useEffect(() => {
    if (!isActive) {
      setIsRunning(false);
      setSeconds(0);
    }
  }, [isActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
      <span className="w-12 text-center text-[var(--accent-color)]">{formatTime(seconds)}</span>
      
      {!isRunning ? (
        <button onClick={(e) => { e.stopPropagation(); setIsRunning(true); }} className="text-gray-500 hover:text-green-500" title="Start">
          <Play size={16} />
        </button>
      ) : (
        <button onClick={(e) => { e.stopPropagation(); setIsRunning(false); }} className="text-gray-500 hover:text-yellow-500" title="Pause">
          <Pause size={16} />
        </button>
      )}
      
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          setIsRunning(false); 
          onStop(seconds); 
          setSeconds(0);
        }} 
        className="text-gray-500 hover:text-red-500" 
        title="Stop"
      >
        <Square size={16} />
      </button>
    </div>
  );
};
