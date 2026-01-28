import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import WantedPoster from '../components/WantedPoster';
import { DEFAULT_DB_URL } from '../config';

const Gallery = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Check if we suspect an auto-config (url has 'db=')
    const [isAutoConfiguring, setIsAutoConfiguring] = useState(() =>
        window.location.href.includes('db=') || !!searchParams.get('db')
    );

    // Initialize from Config > LocalStorage > Empty
    const [dbUrl, setDbUrl] = useState(() => DEFAULT_DB_URL || localStorage.getItem('wanted-list-db-url') || "");

    // Default showSettings is false if we have a URL (Config or Local) OR if we are auto-configuring
    const [showSettings, setShowSettings] = useState(() => {
        if (DEFAULT_DB_URL) return false;
        const hasLocal = !!localStorage.getItem('wanted-list-db-url');
        const isConfiguring = window.location.href.includes('db=') || !!searchParams.get('db');
        return !hasLocal && !isConfiguring;
    });

    // Validates config on mount to fix any stuck states and ensures we don't get stuck on settings
    useEffect(() => {
        if (DEFAULT_DB_URL) {
            setShowSettings(false);
        }
    }, []);

    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");

    // Manual Helper to save and apply
    const applyDbConfig = (url) => {
        localStorage.setItem('wanted-list-db-url', url);
        setDbUrl(url);
        setShowSettings(false);
        setIsAutoConfiguring(false);
        // Clear URL param to look clean
        setSearchParams({});
    };

    // Auto-config from URL share link
    useEffect(() => {
        const attemptConfig = async () => {
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
                    // Restore '+' signs that might have been interpreted as spaces in unencoded URLs
                    const safeParam = paramDb.replace(/ /g, '+');
                    const url = atob(safeParam);
                    if (url.startsWith('http')) {
                        console.log("Auto-configuring DB:", url);
                        applyDbConfig(url);
                        return; // Success
                    }
                } catch (e) {
                    console.error("Auto-config failed", e);
                }
            }

            // If we got here, failed or no param found.
            setIsAutoConfiguring(false);

            // Only force settings if we confirm no DB url is available
            if (!localStorage.getItem('wanted-list-db-url')) {
                setShowSettings(true);
            }
        };

        attemptConfig();
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

    if (isAutoConfiguring) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#1a1a1a', color: '#ffcc33' }}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚓</div>
                <h2 style={{ fontFamily: 'Noto Sans TC' }}>讀取懸賞令中...</h2>
            </div>
        );
    }

    // Explicitly override settings view if we have a hardcoded URL
    // This effectively disables the settings UI if configured in code
    const isHardcoded = !!DEFAULT_DB_URL;
    const shouldShowSettings = !isHardcoded && (!dbUrl || showSettings);

    if (shouldShowSettings) {
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
            overflowX: 'hidden',
            overflowY: 'auto',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            position: 'relative',
            paddingTop: '30px',
            backgroundColor: '#1a1a1a'
        }}>
            {/* Settings Trigger (Only if not hardcoded) */}
            {!DEFAULT_DB_URL && (
                <div
                    onClick={() => setShowSettings(true)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '50px', height: '50px', zIndex: 1000, cursor: 'pointer' }}
                    title="設定"
                ></div>
            )}

            <h1 className="gallery-title" style={{ marginTop: 0, marginBottom: '2vh' }}>蒼貓模型懸賞區</h1>

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
