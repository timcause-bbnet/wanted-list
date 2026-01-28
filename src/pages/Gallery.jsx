import React, { useState, useEffect } from 'react';
import WantedPoster from '../components/WantedPoster';

const Gallery = () => {
    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");
    const [loading, setLoading] = useState(true);
    const LOCAL_STORAGE_KEY = 'wanted-list-data';

    useEffect(() => {
        loadData();
        const handleStorageChange = () => { loadData(); };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const loadData = async () => {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        let loadedPosters = [];
        let loadedBg = "";

        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                loadedPosters = parsed.posters || [];
                loadedBg = parsed.bg || "";
            } catch (e) {
                console.error("Local data parse error", e);
            }
        } else {
            try {
                const res = await fetch('data.json');
                if (res.ok) {
                    const data = await res.json();
                    loadedPosters = data.posters || [];
                    loadedBg = data.bg || "";
                }
            } catch (e) {
                console.error("Failed to load data", e);
            }
        }

        setPosters(loadedPosters);
        setBg(loadedBg);
        if (loadedBg) {
            document.body.style.backgroundImage = `url(${loadedBg})`;
        }
        setLoading(false);
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

    // Divide posters into 3 groups if possible, or just scramble/reuse them
    // Use modulo to distribute
    const getStripData = (offset) => {
        if (posters.length === 0) return [];
        // Just return all posters, maybe rotate order?
        // User said "Can fit 5 photos".
        // Let's just put ALL posters in each strip but shift them?
        // Or actually slice them.
        // If we have 15 posters, 0-4, 5-9, 10-14.
        // If we have fewer, just reuse all.
        if (posters.length >= 15) {
            const chunk = Math.ceil(posters.length / 3);
            if (offset === 0) return posters.slice(0, chunk);
            if (offset === 1) return posters.slice(chunk, chunk * 2);
            return posters.slice(chunk * 2);
        }
        // Rotate array based on offset to simulate variety
        const rotated = [...posters];
        for (let i = 0; i < offset * 2; i++) {
            rotated.push(rotated.shift());
        }
        return rotated;
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>載入中...</div>;

    return (
        <div style={{ overflow: 'hidden' }}>
            <h1 className="gallery-title">蒼貓模型懸賞展示區</h1>

            {posters.length === 0 ? (
                <div style={{ textAlign: 'center', fontSize: '24px', padding: '50px' }}>目前沒有懸賞名單</div>
            ) : (
                <>
                    {/* Strip 1: Right (implies moving to left? No, animate-right usually means moving TOWARDS right. Wait marquee usually moves content LEFT (text goes <--). 
                        User said: "First and Third slide RIGHT (->)", "Second slide LEFT (<-)".
                        "Slide Right" means content moves from Left to Right.
                    */}
                    <div className="film-row">
                        <div className="animate-left">
                            {/* Wait, user said "Right Slide". Standard marquee is "Right to Left" (Leftward motion).
                                If user wants "Slide Right", content moves --->.
                                CSS keyframe `scroll-right` I defined moves translateX(0) to (-50%). That is LEFTWARDS.
                                Let's correct naming in logic.
                                User: "First... Slide Right". 
                                My CSS: `scroll-right` moves 0 to -50% (Left). 
                                `scroll-left` moves -50% to 0 (Right).
                                Actually, 0 to -50% means items move Left.
                                -50% to 0 means items move Right.
                                
                                User Request: "Rows 1 & 3: Slide Right".
                                Interpretation: Direction of motion is --->.
                                So I should use the animation that moves -50% to 0.
                                
                                User Request: "Row 2: Slide Left".
                                Interpretation: Direction of motion is <---.
                                I should use 0 to -50%.
                             */}
                            {renderMarqueeContent(getStripData(0))}
                        </div>
                    </div>
                    {/* Actually, the class names in CSS:
                        animate-right: scroll-right (0 -> -50%). This moves LEFT.
                        animate-left: scroll-left (-50% -> 0). This moves RIGHT.
                        I messed up the naming in CSS step. 
                        scroll-right usually implies "scroll *to* right"? Or "scroll *towards* right"?
                        Let's just bind them to the user intent:
                        
                        Row 1 (Right): Content moves --->. Need (-50% to 0). That is my `scroll-left` keyframe.
                        Row 2 (Left): Content moves <---. Need (0 to -50%). That is my `scroll-right` keyframe.
                    */}

                    {/* Row 1: Move Right ---> */}
                    <div className="film-row">
                        <div style={{ display: 'flex', gap: '50px', animation: 'scroll-left 40s linear infinite' }}>
                            {renderMarqueeContent(getStripData(0))}
                        </div>
                    </div>

                    {/* Row 2: Move Left <--- */}
                    <div className="film-row">
                        <div style={{ display: 'flex', gap: '50px', animation: 'scroll-right 40s linear infinite' }}>
                            {renderMarqueeContent(getStripData(1))}
                        </div>
                    </div>

                    {/* Row 3: Move Right ---> */}
                    <div className="film-row">
                        <div style={{ display: 'flex', gap: '50px', animation: 'scroll-left 40s linear infinite' }}>
                            {renderMarqueeContent(getStripData(2))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Gallery;
