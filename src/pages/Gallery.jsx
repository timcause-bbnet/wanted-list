import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import WantedPoster from '../components/WantedPoster';

const Gallery = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize from LocalStorage
    const [dbUrl, setDbUrl] = useState(() => localStorage.getItem('wanted-list-db-url') || "");
    // If we have a DB URL, don't show settings. OR if we have a pending 'db' param, don't show settings yet (wait for effect).
    const [showSettings, setShowSettings] = useState(() => {
        const hasLocal = !!localStorage.getItem('wanted-list-db-url');
        const hasParam = window.location.href.includes('db=');
        return !hasLocal && !hasParam;
    });

    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");
    const [loading, setLoading] = useState(false);

    // Manual Helper to save and apply
    const applyDbConfig = (url) => {
        localStorage.setItem('wanted-list-db-url', url);
        setDbUrl(url);
        setShowSettings(false);
        // Clear URL param to look clean
        setSearchParams({});
    };

    // Auto-config from URL share link
    useEffect(() => {
        // Try standard param
        let paramDb = searchParams.get('db');

        // Fallback: Manual Parse (HashRouter sometimes tricky)
        if (!paramDb && window.location.href.includes('db=')) {
            try {
                const parts = window.location.href.split('db=');
                if (parts[1]) {
                    paramDb = parts[1].split('&')[0];
                }
            } catch (e) { }
        }

        if (paramDb) {
            try {
                // Handle potential double encoding or weird chars
                const cleanParam = paramDb.replace(/[^A-Za-z0-9+/=]/g, "");
                const url = atob(cleanParam);
                if (url.startsWith('http')) {
                    console.log("Auto-configuring DB:", url);
                    applyDbConfig(url);
                }
            } catch (e) {
                console.error("Auto-config failed", e);
            }
        } else if (!dbUrl) {
            // Only show settings if we really have no DB and no param
            setShowSettings(true);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!dbUrl) return;

        loadData();
        const interval = setInterval(() => {
            loadData();
        }, 5000);

        return () => clearInterval(interval);
    }, [dbUrl]);

    const getFirebaseUrl = () => {
        if (!dbUrl) return "";
        let url = dbUrl.trim();
        if (url.endsWith('/')) url = url.slice(0, -1);
        return `${url}/wanted-list.json`;
    };

    const loadData = async () => {
        try {
            const url = getFirebaseUrl();
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setPosters(data.posters || []);
                    setBg(data.bg || "");
                    if (data.bg) {
                        document.body.style.backgroundImage = `url(${data.bg})`;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to load from DB", e);
        }
    };



    // Helper to generate a seamless loop content
    const renderMarqueeContent = (sourcePosters) => {
        if (sourcePosters.length === 0) return <div style={{ color: '#fff', fontSize: '20px' }}>Waiting for bounty...</div>;

        let displayList = [...sourcePosters];
        // Ensure enough items for smooth loop
        while (displayList.length < 10) {
            displayList = [...displayList, ...sourcePosters];
        }

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

    const getStripData = (offset) => {
        if (posters.length === 0) return [];
        if (posters.length >= 10) {
            const chunk = Math.ceil(posters.length / 2);
            if (offset === 0) return posters.slice(0, chunk);
            return posters.slice(chunk);
        }
        const rotated = [...posters];
        for (let i = 0; i < offset * 3; i++) {
            rotated.push(rotated.shift());
        }
        return rotated;
    };

    if (!dbUrl || showSettings) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#1a1a1a', color: 'white' }}>
                <h1 className="gallery-title">展示區設定</h1>
                <div style={{ background: '#333', padding: '30px', borderRadius: '10px', textAlign: 'center', border: '2px solid #ffcc33' }}>
                    <p>請輸入資料庫網址 (Firebase Realtime Database URL)</p>
                    <input
                        type="text"
                        placeholder="https://your-project.firebaseio.com"
                        defaultValue={dbUrl}
                        onBlur={(e) => applyDbConfig(e.target.value)}
                        style={{ padding: '10px', width: '300px', borderRadius: '5px', border: 'none' }}
                    />
                    <p style={{ fontSize: '12px', color: '#aaa', marginTop: '10px' }}>輸入後點擊空白處自動儲存</p>
                    {dbUrl && <button onClick={() => setShowSettings(false)} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>進入展示</button>}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            overflow: 'hidden',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative'
        }}>
            {/* Settings Trigger */}
            <div
                onClick={() => setShowSettings(true)}
                style={{ position: 'absolute', top: 0, left: 0, width: '50px', height: '50px', zIndex: 1000, cursor: 'pointer' }}
                title="設定"
            ></div>

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
