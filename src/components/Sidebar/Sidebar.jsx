import React from 'react';
import Spottable from "@enact/spotlight/Spottable";
import SpotlightContainerDecorator from '@enact/spotlight/SpotlightContainerDecorator';

const SpottableDiv = Spottable("div");
const Container = SpotlightContainerDecorator({ enterTo: 'last-focused' }, 'div');

const Sidebar = ({ 
    visible, channels, current, setCurrent, focusedIndex, setFocusedIndex, 
    isSettingsOpen, setIsSettingsOpen, itemRefs, scrollToIndex, showOverlays, onLogout 
}) => {
    const user = JSON.parse(localStorage.getItem('iptv_user')) || {};

    return (
        <div 
            className="glass-morphism"
            style={{ 
                width: "400px", height: "100%", display: "flex", flexDirection: "column",
                transform: visible ? "translateX(0)" : "translateX(-100%)", 
                transition: "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
                pointerEvents: "auto", 
                borderRight: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "0 16px 16px 0"
            }}
        >
            {/* Header */}
            <div style={{ padding: "30px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#a78bfa" }}>Scrappy IPTV</div>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "6px" }}>
                        {isSettingsOpen ? "Account Settings" : `${channels.length} Channels available`}
                    </div>
                </div>
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
                        <SpottableDiv onClick={onLogout} style={{ background: "rgba(255, 107, 107, 0.15)", border: "1px solid rgba(255, 107, 107, 0.3)", color: "#ff6b6b", textAlign: "center", padding: "16px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }}>
                            Sign Out
                        </SpottableDiv>
                    </div>
                ) : (
                    // --- CHANNELS VIEW ---
                    <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
                        {channels.map((c, index) => (
                            <SpottableDiv
                                key={c.id}
                                ref={(el) => (itemRefs.current[index] = el)}
                                onSpotlightFocus={() => {
                                    setFocusedIndex(index);
                                    scrollToIndex(index);
                                    showOverlays();
                                }}
                                onClick={() => {
                                    setCurrent(c);
                                    showOverlays();
                                }}
                                style={{
                                    padding: "16px", color: "white", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", marginBottom: "8px",
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
    );
};

export default Sidebar;