import { useEffect, useRef } from 'react';

export const useTVNavigation = ({ 
    channels, 
    isSettingsOpen, 
    sidebarVisible, 
    setIsSettingsOpen, 
    setSidebarVisible, 
    showOverlays, 
    setCurrent, 
    setFocusedIndex, 
    scrollToIndex 
}) => {
    const numberBufferRef = useRef(""); 
    const numberTimeoutRef = useRef(null);

    useEffect(() => {
        if (channels.length === 0) return;

        const handleKey = (e) => {
            const key = e.keyCode || e.which;
            
            // Wake up UI on navigation keys
            if ([37, 38, 39, 40, 13].includes(key)) {
                showOverlays();
            }

            // Back button
            if (key === 461 || key === 27) { 
                e.preventDefault();
                if (isSettingsOpen) setIsSettingsOpen(false);
                else if (sidebarVisible) setSidebarVisible(false);
                else showOverlays(); 
            } 
            
            // Numpad entry
            else if (key >= 48 && key <= 57) { 
                e.preventDefault();
                const digit = key - 48; 
                numberBufferRef.current += digit.toString();
                showOverlays(); 
                
                if (numberTimeoutRef.current) clearTimeout(numberTimeoutRef.current);
                
                numberTimeoutRef.current = setTimeout(() => {
                    const targetIndex = parseInt(numberBufferRef.current, 10) - 1; 
                    if (channels[targetIndex]) {
                        setCurrent(channels[targetIndex]);
                        setFocusedIndex(targetIndex);
                        scrollToIndex(targetIndex);
                    }
                    numberBufferRef.current = ""; 
                }, 1500);
            }
        };
        
        window.addEventListener("keydown", handleKey, true);
        return () => window.removeEventListener("keydown", handleKey, true);
    }, [channels, showOverlays, isSettingsOpen, sidebarVisible, scrollToIndex, setCurrent, setFocusedIndex, setIsSettingsOpen, setSidebarVisible]);
};