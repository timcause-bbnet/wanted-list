import React, { useState, useEffect } from 'react';
import WantedPoster from '../components/WantedPoster';

const Gallery = () => {
    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");
    const [loading, setLoading] = useState(true);
    const LOCAL_STORAGE_KEY = 'wanted-list-data';

    useEffect(() => {
        loadData();

        // Listen for updates from Admin tab
        const handleStorageChange = () => {
            loadData();
        };
        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const loadData = async () => {
        // 1. Try LocalStorage first (Real-time updates from Admin)
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                setPosters(parsed.posters || []);
                setBg(parsed.bg || "");
                if (parsed.bg) {
                    document.body.style.backgroundImage = `url(${parsed.bg})`;
                }
                setLoading(false);
                return;
            } catch (e) {
                console.error("Local data parse error", e);
            }
        }

        // 2. Fallback to GitHub data (Static initial data)
        try {
            const res = await fetch('data.json');
            if (res.ok) {
                const data = await res.json();
                setPosters(data.posters || []);
                setBg(data.bg || "");
                if (data.bg) {
                    document.body.style.backgroundImage = `url(${data.bg})`;
                }
            }
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="gallery-title">蒼貓模型懸賞展示區</h1>

            <div id="poster-container">
                {loading && <div>載入中...</div>}
                {!loading && posters.length === 0 && <div>目前沒有懸賞名單</div>}

                {posters.map((p, i) => (
                    <WantedPoster key={i} {...p} />
                ))}
            </div>
        </div>
    );
};

export default Gallery;
