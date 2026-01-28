import React, { useState, useEffect } from 'react';
import WantedPoster from '../components/WantedPoster';

const Gallery = () => {
    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");
    const [loading, setLoading] = useState(true);
    // API URL
    const API_URL = 'http://localhost:8000/api/data';

    useEffect(() => {
        loadData();

        // Poll every 5 seconds to get updates from other clients/admin
        const interval = setInterval(() => {
            loadData();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                const data = await res.json();
                setPosters(data.posters || []);
                setBg(data.bg || "");
                if (data.bg) {
                    document.body.style.backgroundImage = `url(${data.bg})`;
                }
                setLoading(false);
            }
        } catch (e) {
            console.error("Failed to load from server", e);
            // Optionally fallback to local cache or do nothing
        }
    };


    // Helper to generate a seamless loop content
    // We duplicate content to ensure smooth scrolling
    const renderMarqueeContent = (sourcePosters) => {
        if (sourcePosters.length === 0) return <div>Waiting for bounty...</div>;

        // If few posters, repeat them many times to fill width
        let displayList = [...sourcePosters];
        while (displayList.length < 10) {
            displayList = [...displayList, ...sourcePosters];
        }

        // We replicate the list TWICE in a flex container to create seamless loop
        // The first set slides out, the second set slides in.
        return (
            <div className="film-track">
                {displayList.map((p, i) => (
                    <WantedPoster key={`a-${i}`} {...p} />
                ))}
                {displayList.map((p, i) => (
                    <WantedPoster key={`b-${i}`} {...p} />
                ))}
            </div>
        );
    };

    // Divide posters into 2 groups
    const getStripData = (offset) => {
        if (posters.length === 0) return [];

        // If we have enough posters, split them
        if (posters.length >= 10) {
            const chunk = Math.ceil(posters.length / 2);
            if (offset === 0) return posters.slice(0, chunk);
            return posters.slice(chunk);
        }
        // If few posters, just rotate/copy
        const rotated = [...posters];
        for (let i = 0; i < offset * 3; i++) {
            rotated.push(rotated.shift());
        }
        return rotated;
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>載入中...</div>;

    return (
        <div style={{
            overflow: 'hidden',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
        }}>
            <h1 className="gallery-title" style={{ marginTop: 0, marginBottom: '2vh' }}>蒼貓模型懸賞展示區</h1>

            {posters.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: '24px', padding: '50px' }}>目前沒有懸賞名單</div>
            ) : (
                <>
                    {/* Row 1: Move Left <--- (0 to -50%) */}
                    <div className="film-row" style={{ margin: '2vh 0' }}>
                        <div style={{ display: 'flex', gap: '50px', animation: 'scroll-right 40s linear infinite' }}>
                            {renderMarqueeContent(getStripData(0))}
                        </div>
                    </div>

                    {/* Row 2: Move Right ---> (-50% to 0) */}
                    <div className="film-row" style={{ margin: '2vh 0' }}>
                        <div style={{ display: 'flex', gap: '50px', animation: 'scroll-left 40s linear infinite' }}>
                            {renderMarqueeContent(getStripData(1))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Gallery;
