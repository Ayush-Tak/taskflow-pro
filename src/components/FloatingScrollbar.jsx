import { useState, useEffect, useRef } from 'react';

/**
 * FloatingScrollbar Component
 * A custom floating horizontal scrollbar that stays at the bottom of the screen on mobile
 */
const FloatingScrollbar = ({ targetElementRef }) => {
  const [thumbData, setThumbData] = useState({ width: 0, left: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    const element = targetElementRef?.current;
    if (!element) return;

    const updateThumb = () => {
      const { scrollLeft, scrollWidth, clientWidth } = element;
      
      // Check if scrolling is needed
      if (scrollWidth <= clientWidth) {
        setShowScrollbar(false);
        return;
      }
      
      setShowScrollbar(true);
      
      // Calculate thumb size and position
      const thumbWidth = Math.max((clientWidth / scrollWidth) * 100, 10);
      const maxLeft = 100 - thumbWidth;
      const thumbLeft = (scrollLeft / (scrollWidth - clientWidth)) * maxLeft;

      setThumbData({
        width: thumbWidth,
        left: isNaN(thumbLeft) ? 0 : Math.max(0, Math.min(maxLeft, thumbLeft))
      });
    };

    element.addEventListener('scroll', updateThumb);
    const resizeObserver = new ResizeObserver(updateThumb);
    resizeObserver.observe(element);
    updateThumb();

    return () => {
      element.removeEventListener('scroll', updateThumb);
      resizeObserver.disconnect();
    };
  }, [targetElementRef]);

  const handleMouseDown = (e) => {
    if (!targetElementRef?.current) return;
    e.preventDefault();
    
    const startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const startScrollLeft = targetElementRef.current.scrollLeft;
    
    setIsDragging(true);

    const handleMouseMove = (e) => {
      if (!targetElementRef?.current || !trackRef.current) return;
      
      const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const deltaX = currentX - startX;
      const trackWidth = trackRef.current.offsetWidth;
      const element = targetElementRef.current;
      const scrollableWidth = element.scrollWidth - element.clientWidth;
      
      const newScrollLeft = startScrollLeft + (deltaX / trackWidth) * scrollableWidth;
      element.scrollLeft = Math.max(0, Math.min(scrollableWidth, newScrollLeft));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
  };

  const handleTrackClick = (e) => {
    if (!targetElementRef?.current || !trackRef.current || isDragging) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const element = targetElementRef.current;
    const scrollableWidth = element.scrollWidth - element.clientWidth;
    
    element.scrollLeft = percentage * scrollableWidth;
  };

  if (!showScrollbar) return null;

  return (
    <div className="floating-scrollbar md:hidden">
      <div
        ref={trackRef}
        className="floating-scrollbar-track"
        onClick={handleTrackClick}
      >
        <div
          className="floating-scrollbar-thumb"
          style={{
            width: `${thumbData.width}%`,
            left: `${thumbData.left}%`,
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        />
      </div>
    </div>
  );
};

export default FloatingScrollbar;