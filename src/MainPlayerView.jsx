import { useState, useRef, useCallback, useEffect } from "react";
import { streamService } from "./services/streamService";
import VideoPlayer from "./components/VideoPlayer";
import Sidebar from "./components/Sidebar/Sidebar";
import ChannelBanner from "./components/ChannelBanner";
import { useTVNavigation } from "./hooks/useTVNavigation";

const MainPlayerView = ({ onLogout }) => {
    const itemRefs = useRef([]);
    const bannerTimerRef = useRef(null);
    const sidebarTimerRef = useRef(null);

    const [channels, setChannels] = useState([]);
    const [current, setCurrent] = useState(null);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [bannerVisible, setBannerVisible] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Fetch Channels
    useEffect(() => {
        streamService.getChannels().then(setChannels).catch(console.error);
    }, []);

    // UI Timeout Logic
    const showOverlays = useCallback(() => {
        setBannerVisible(true);
        setSidebarVisible(true);
        
        if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
        if (sidebarTimerRef.current) clearTimeout(sidebarTimerRef.current);
        
        if (!isSettingsOpen) {
            bannerTimerRef.current = setTimeout(() => setBannerVisible(false), 4000);
            sidebarTimerRef.current = setTimeout(() => setSidebarVisible(false), 6000);
        }
    }, [isSettingsOpen]);

    useEffect(() => { showOverlays(); }, [isSettingsOpen, showOverlays]);

    const scrollToIndex = useCallback((index) => {
        if (!isSettingsOpen) {
            itemRefs.current[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [isSettingsOpen]);

    // Attach TV Remote Logic
    useTVNavigation({
        channels, isSettingsOpen, sidebarVisible, setIsSettingsOpen, 
        setSidebarVisible, showOverlays, setCurrent, setFocusedIndex, scrollToIndex
    });

    return (
        <div style={{ width: "100vw", height: "100vh", background: "black", position: "relative", overflow: "hidden" }}>
            {/* 1. Video Player */}
            <VideoPlayer currentChannel={current} />

            {/* 2. Overlays */}
            <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                
                <Sidebar 
                    visible={sidebarVisible}
                    channels={channels}
                    current={current}
                    setCurrent={setCurrent}
                    focusedIndex={focusedIndex}
                    setFocusedIndex={setFocusedIndex}
                    isSettingsOpen={isSettingsOpen}
                    setIsSettingsOpen={setIsSettingsOpen}
                    itemRefs={itemRefs}
                    scrollToIndex={scrollToIndex}
                    showOverlays={showOverlays}
                    onLogout={onLogout}
                />

                <ChannelBanner channel={current} visible={bannerVisible && !isSettingsOpen} />
            </div>
        </div>
    );
};

export default MainPlayerView;