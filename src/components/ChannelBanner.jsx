import React from 'react';

const ChannelBanner = ({ channel, visible }) => {
    // MOCK EPG DATA
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
            {/* 1. CHANNEL IDENTITY */}
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
                        <div style={{ fontSize: "0.85rem", color: "#a78bfa", letterSpacing: "3px", textTransform: "uppercase", fontWeight: "600", marginBottom: "8px" }}>LIVE TV</div>
                        <div style={{ fontSize: "2.2rem", fontWeight: "bold", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "250px" }}>
                            {channel.name}
                        </div>
                        <div style={{ fontSize: "1rem", color: '#bbb', marginTop: "6px" }}>{channel.group}</div>
                    </div>
                )}
            </div>

            {/* 2. DIVIDER LINE */}
            <div style={{ width: "1px", height: "70px", background: "rgba(255,255,255,0.15)" }} />

            {/* 3. EPG SECTION */}
            {channel && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
                        <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                            <div style={{ width: `${mockEpg.nowPlaying.progress}%`, height: "100%", background: "#a78bfa", boxShadow: "0 0 10px rgba(167,139,250,0.8)" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <span style={{ fontSize: "0.8rem", color: "#666", fontWeight: "bold", marginRight: "12px", letterSpacing: "1px" }}>NEXT</span>
                            <span style={{ fontSize: "1rem", color: "#bbb" }}>{mockEpg.upNext.title}</span>
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: "500" }}>{mockEpg.upNext.start}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChannelBanner;