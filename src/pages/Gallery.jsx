import React, { useState, useEffect } from 'react';

import WantedPoster from '../components/WantedPoster';

const Gallery = () => {
    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");
    const [loading, setLoading] = useState(true);

    // Note: Using raw.githubusercontent.com might cache. 
    const user = "timcause-bbnet";
    const repo = "wanted-list";
    const branch = "main"; // Assuming data.json is on main/master

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/${branch}/data.json?t=${Date.now()}`);
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
