/* eslint-disable */
import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { streamService } from "../../services/streamService"; // Ensure path matches your project
import Spottable from "@enact/spotlight/Spottable";
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';

const SpottableDiv = Spottable("div");
const Container = SpotlightContainerDecorator({ enterTo: 'last-focused' }, 'div');

// --- Modern Glass Channel Banner Component ---
// --- Modern Glass Channel Banner with EPG ---
const ChannelBanner = ({ channel, visible }) => {
    
    // MOCK EPG DATA: In production, you will fetch this based on the channel.id
    const mockEpg = {
        nowPlaying: { title: "Top News Headlines", start: "11:00 PM", end: "12:00 AM", progress: 55 },
        upNext: { title: "Late Night Debate", start: "12:00 AM", end: "01:00 AM" }
    };

    return (
        <div 
            className="glass-morphism"
            style={{
                position: "absolute", bottom: "40px", left: "440px", right: "40px", 
                padding: "24px 32px",
                transform: visible ? "translateY(0)" : "translateY(150%)",
                opacity: visible ? 1 : 0,
                transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                display: "flex", alignItems: "center", gap: "40px"
            }}
        >
            {/* 1. CHANNEL IDENTITY (Left Side) */}
            <div style={{ display: "flex", alignItems: "center", gap: "24px", minWidth: "300px" }}>
                {channel && channel.logo && (
                    <img
                        src={channel.logo}
                        style={{ width: "80px", height: "80px", borderRadius: "12px", objectFit: "cover", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                        alt=""
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                )}
                {channel && (
                    <div>
                        <div style={{ fontSize: "0.85rem", color: "#a78bfa", letterSpacing: "3px", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>
                            LIVE TV
                        </div>
                        <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "250px" }}>
                            {channel.name}
                        </div>
                        <div style={{ fontSize: "1rem", color: '#bbb', marginTop: "6px" }}>
                            {channel.group}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. SUBTLE DIVIDER LINE */}
            <div style={{ width: "1px", height: "70px", background: "rgba(255,255,255,0.15)" }} />

            {/* 3. EPG SECTION (Right Side) */}
            {channel && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    
                    {/* Now Playing */}
                    <div style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                            <div>
                                <span style={{ fontSize: "0.8rem", color: "#a78bfa", fontWeight: "bold", marginRight: "12px", letterSpacing: "1px" }}>NOW</span>
                                <span style={{ fontSize: "1.3rem", color: "#fff", fontWeight: "600" }}>{mockEpg.nowPlaying.title}</span>
                            </div>
                            <div style={{ fontSize: "0.9rem", color: "#888", fontWeight: "500" }}>
                                {mockEpg.nowPlaying.start} - {mockEpg.nowPlaying.end}
                            </div>
                        </div>
                        
                        {/* Neon Progress Bar */}
                        <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${mockEpg.nowPlaying.progress}%`, height: "100%", background: "#a78bfa", boxShadow: "0 0 10px rgba(167,139,250,0.8)" }} />
                        </div>
                    </div>

                    {/* Up Next */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <span style={{ fontSize: "0.8rem", color: "#666", fontWeight: "bold", marginRight: "12px", letterSpacing: "1px" }}>NEXT</span>
                            <span style={{ fontSize: "1rem", color: "#bbb" }}>{mockEpg.upNext.title}</span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: "500" }}>
                            {mockEpg.upNext.start}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

// --- Main Player View ---
const MainPlayerView = ({ onLogout }) => {
  // Video & Data Refs
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const numberBufferRef = useRef(""); 
  const numberTimeoutRef = useRef(null);
  const itemRefs = useRef([]);
  const bannerTimerRef = useRef(null);
  const sidebarTimerRef = useRef(null);

  // State
  const [channels, setChannels] = useState([]);
  const [current, setCurrent] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [bannerVisible, setBannerVisible] = useState(false);
  
  // Settings / User State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('iptv_user')) || {};

  // 1. Fetch Channels
  useEffect(() => {
    streamService.getChannels().then(setChannels).catch(console.error);
  }, []);

  // 2. Stable Player Initialization
  const initPlayer = useCallback((video, url) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(e => console.log("Playback failed", e));
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("Fatal HLS error, retrying...");
          hls.destroy();
          initPlayer(video, url);
        }
      });
      hlsRef.current = hls;
    }
  }, []);

  // 3. Trigger Player on Channel Change
  useEffect(() => {
    if (current && videoRef.current) {
      initPlayer(videoRef.current, current.url);
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [current, initPlayer]);

  // 4. UI Timeout Logic (Auto-hide overlay)
  const showOverlays = useCallback(() => {
    setBannerVisible(true);
    setSidebarVisible(true);
    
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    if (sidebarTimerRef.current) clearTimeout(sidebarTimerRef.current);
    
    // Only auto-hide if settings are NOT open. We don't want the menu vanishing while they read their profile.
    if (!isSettingsOpen) {
        bannerTimerRef.current = setTimeout(() => setBannerVisible(false), 4000);
        sidebarTimerRef.current = setTimeout(() => setSidebarVisible(false), 6000);
    }
  }, [isSettingsOpen]);

  // Update auto-hide when settings toggle changes
  useEffect(() => {
    showOverlays();
  }, [isSettingsOpen, showOverlays]);

  const scrollToIndex = useCallback((index) => {
    if (!isSettingsOpen) {
      itemRefs.current[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isSettingsOpen]);

  // 5. TV Remote Control Handling (D-Pad)
  useEffect(() => {
    if (channels.length === 0) return;

    const handleKey = (e) => {
      const key = e.keyCode || e.which;
      
      if (key === 38 && !isSettingsOpen) { // UP
        e.preventDefault();
        setSidebarVisible(true);
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : channels.length - 1;
          scrollToIndex(next);
          return next;
        });
      } else if (key === 40 && !isSettingsOpen) { // DOWN
        e.preventDefault();
        setSidebarVisible(true);
        setFocusedIndex((prev) => {
          const next = prev < channels.length - 1 ? prev + 1 : 0;
          scrollToIndex(next);
          return next;
        });
      } else if (key === 13) { // OK / ENTER
        // We only intercept ENTER for channels. Spottable handles the gear/logout clicks automatically.
        if (!isSettingsOpen) {
          e.preventDefault();
          setFocusedIndex((prev) => {
            const channel = channels[prev];
            if (channel) {
              setCurrent(channel);
              showOverlays();
            }
            return prev;
          });
        }
      } else if (key === 461) { // BACK button (LG Remote)
        e.preventDefault();
        if (isSettingsOpen) {
            setIsSettingsOpen(false); // Close settings first
        } else {
            setSidebarVisible((v) => !v); // Or toggle sidebar
        }
      } else if (key === 37 || key === 39) { // LEFT / RIGHT
        e.preventDefault();
        showOverlays();
      }
      else if (key >= 48 && key <= 57) { 
        e.preventDefault();
        
        // 1. Get the number the user just pressed (0-9)
        const digit = key - 48; 
        
        // 2. Add it to our buffer (e.g., if they press 1 then 0, buffer becomes "10")
        numberBufferRef.current += digit.toString();
        
        // 3. Wake up the UI so they know the TV is listening
        showOverlays(); 
        
        // 4. Clear any existing countdown
        if (numberTimeoutRef.current) clearTimeout(numberTimeoutRef.current);
        
        // 5. Wait 1.5 seconds for them to finish typing
        numberTimeoutRef.current = setTimeout(() => {
            const targetChannelNumber = parseInt(numberBufferRef.current, 10);
            
            // Assuming your channels array is in order, jump to that index
            // (If channel 1 is at index 0, you might need targetChannelNumber - 1)
            const targetIndex = targetChannelNumber - 1; 
            
            if (channels[targetIndex]) {
                setCurrent(channels[targetIndex]);
                setFocusedIndex(targetIndex);
                scrollToIndex(targetIndex);
            } else {
                console.log("Channel doesn't exist:", targetChannelNumber);
            }
            
            // Clear the buffer for the next time they type
            numberBufferRef.current = ""; 
        }, 1500);}
      
    };
    
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [channels, scrollToIndex, showOverlays, isSettingsOpen]);


  return (
    <div style={{ width: "100vw", height: "100vh", background: "black", position: "relative", overflow: "hidden" }}>
      
      {/* LAYER 1: The Video */}
      <video 
        ref={videoRef} 
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 0 }} 
      />

      {/* LAYER 2: The Glass UI Overlays */}
      <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
        
        {/* Sidebar */}
        <div 
          className="glass-morphism"
          style={{ 
            width: "400px", height: "100%", display: "flex", flexDirection: "column",
            transform: sidebarVisible ? "translateX(0)" : "translateX(-100%)", 
            transition: "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
            pointerEvents: "auto", 
            borderRight: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "0 16px 16px 0"
          }}
        >
          {/* Header with Settings Gear */}
          <div style={{ padding: "30px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div>
                <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#a78bfa" }}>Scrappy IPTV</div>
                <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "6px" }}>
                   {isSettingsOpen ? "Account Settings" : `${channels.length} Channels available`}
                </div>
             </div>
             {/* The Gear Icon */}
             <SpottableDiv 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                style={{ 
                    fontSize: "1.5rem", padding: "8px", borderRadius: "50%", 
                    background: isSettingsOpen ? "rgba(167,139,250,0.3)" : "transparent",
                    cursor: "pointer", transition: "all 0.2s"
                }}
             >
                ⚙️
             </SpottableDiv>
          </div>

          <Container style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "hidden" }}>
             {/* Conditional Rendering: Settings OR Channels */}
             {isSettingsOpen ? (
                // --- SETTINGS VIEW ---
                <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "0.85rem", color: "#888", textTransform: "uppercase", letterSpacing: "1px" }}>Subscriber</div>
                            <div style={{ fontSize: "1.4rem", color: "#fff", fontWeight: "bold" }}>{user.name || "Unknown User"}</div>
                            <div style={{ fontSize: "0.9rem", color: "#a78bfa" }}>@{user.username}</div>
                        </div>

                        <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
                            <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "4px" }}>Active Package</div>
                            <div style={{ fontSize: "1.1rem", color: "#fff" }}>Tier {user.package_id || "N/A"}</div>
                        </div>

                        <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "12px" }}>
                            <div style={{ fontSize: "0.8rem", color: "#888", marginBottom: "4px" }}>Expiration Date</div>
                            <div style={{ fontSize: "1.1rem", color: user.expiry_date ? "#fff" : "#ff6b6b" }}>
                                {user.expiry_date ? new Date(user.expiry_date).toLocaleDateString() : "No active sub"}
                            </div>
                        </div>
                    </div>

                    {/* Logout Button Pinned to Bottom */}
                    <SpottableDiv 
                        onClick={onLogout}
                        style={{ 
                            background: "rgba(255, 107, 107, 0.15)", border: "1px solid rgba(255, 107, 107, 0.3)",
                            color: "#ff6b6b", textAlign: "center", padding: "16px", borderRadius: "12px",
                            fontWeight: "bold", cursor: "pointer", marginTop: "20px"
                        }}
                    >
                        Sign Out
                    </SpottableDiv>
                </div>
             ) : (
                // --- CHANNELS VIEW ---
                <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                    {channels.map((c, index) => (
                    <SpottableDiv
                        key={c.id}
                        onClick={() => {
                        setCurrent(c);
                        setFocusedIndex(index);
                        showOverlays();
                        }}
                        ref={(el) => (itemRefs.current[index] = el)}
                        style={{
                        padding: "16px", color: "white", borderRadius: "12px",
                        cursor: "pointer", display: "flex", alignItems: "center",
                        marginBottom: "8px",
                        background: focusedIndex === index ? "rgba(255,255,255,0.15)" : "transparent",
                        border: current?.id === c.id ? "1px solid rgba(167,139,250,0.8)" : "1px solid transparent",
                        boxShadow: current?.id === c.id ? "inset 0 0 10px rgba(167,139,250,0.2)" : "none",
                        transition: "all 0.2s ease"
                        }}
                    >
                        <img src={c.logo} width="48" height="48" alt="" style={{ marginRight: '16px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ overflow: "hidden" }}>
                            <div style={{ fontWeight: "600", fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: current?.id === c.id ? "#a78bfa" : "#fff" }}>
                            {c.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "4px" }}>{c.group}</div>
                        </div>
                    </SpottableDiv>
                    ))}
                </div>
             )}
          </Container>
        </div>

        {/* Channel Banner - Floats on the bottom */}
        <ChannelBanner channel={current} visible={bannerVisible && !isSettingsOpen} />
      </div>
    </div>
  );
};

export default MainPlayerView;