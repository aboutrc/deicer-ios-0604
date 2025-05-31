import React, { useState, useEffect, useRef } from 'react';
import { useWindowSize } from '@react-hook/window-size';

interface AnimatedTitleProps {
  className?: string;
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ className = '' }) => {
  const [currentTitle, setCurrentTitle] = useState<'DEICER' | 'VIGIA'>('DEICER');
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [width] = useWindowSize();
  
  // Determine font size based on screen width
  const fontSize = width < 640 ? '1.75rem' : '2.25rem';

  useEffect(() => {
    // Set up the interval to switch between titles
    const startAnimation = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        // Start fade out animation
        setIsAnimating(true);
        
        // After fade out completes, change the title
        setTimeout(() => {
          setCurrentTitle(prev => prev === 'DEICER' ? 'VIGIA' : 'DEICER');
          
          // Start fade in animation
          setTimeout(() => {
            setIsAnimating(false);
            
            // Schedule the next animation
            startAnimation();
          }, 300); // Fade in duration
        }, 500); // Fade out duration
      }, 60000); // 60 seconds between changes
    };
    
    // Start the animation cycle
    startAnimation();
    
    // Clean up on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'} ${className}`}>
      <h1 
        className="font-['Special_Gothic_Expanded_One'] font-normal uppercase tracking-widest"
        style={{ 
          fontSize,
          background: 'linear-gradient(45deg, #fff, #a3a3a3)', 
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4))',
          margin: 0,
          padding: 0,
          lineHeight: 1
        }}
      >
        {currentTitle}
      </h1>
    </div>
  );
};

export default AnimatedTitle;