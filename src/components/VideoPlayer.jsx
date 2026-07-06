import { useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";

const VideoPlayer = ({ currentChannel }) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

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
                    hls.destroy();
                    initPlayer(video, url);
                }
            });
            hlsRef.current = hls;
        }
    }, []);

    useEffect(() => {
        if (currentChannel && videoRef.current) {
            initPlayer(videoRef.current, currentChannel.url);
        }
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [currentChannel, initPlayer]);

    return (
        <video 
            ref={videoRef} 
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 0 }} 
        />
    );
};

export default VideoPlayer;