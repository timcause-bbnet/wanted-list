import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WantedPoster from '../components/WantedPoster';

const Admin = () => {
    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");
    const LOCAL_STORAGE_KEY = 'wanted-list-data';

    const [newPoster, setNewPoster] = useState({
        crime: "",
        name: "",
        bounty: "",
        img: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    // Auto-save to LocalStorage whenever posters or bg changes
    useEffect(() => {
        // Only save if we have data to save, or if we want to confirm clear (which is handled separately)
        // Check if initial load is done to avoid overwriting with empty
        const save = () => {
            const data = { posters, bg };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            // Trigger storage event for other tabs to pick up
            window.dispatchEvent(new Event('storage'));
        };

        // Simple debounce or just save
        // For 'instant' feeling, save immediately on state change
        if (posters.length > 0 || bg) {
            save();
        }
    }, [posters, bg]);

    useEffect(() => {
        if (bg) {
            document.body.style.backgroundImage = `url(${bg})`;
        }
    }, [bg]);

    const loadData = async () => {
        // 1. Try LocalStorage first
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                setPosters(parsed.posters || []);
                setBg(parsed.bg || "");
                return;
            } catch (e) {
                console.error("Local data parse error", e);
            }
        }

        // 2. Fallback to GitHub data.json (view only)
        try {
            const res = await fetch('data.json');
            if (res.ok) {
                const data = await res.json();
                setPosters(data.posters || []);
                setBg(data.bg || "");
                // Sync initial github data to localstorage so it's editable immediately?
                // localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            }
        } catch (e) {
            console.error("Fetch data error", e);
        }
    };

    const handleBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setBg(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleImgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setNewPoster({ ...newPoster, img: e.target.result });
            reader.readAsDataURL(file);
        }
    };

    const addPoster = () => {
        if (!newPoster.img) return alert("請上傳人物照片！");

        setPosters([...posters, {
            ...newPoster,
            name: newPoster.name || "UNKNOWN",
            bounty: "฿ " + Number(newPoster.bounty).toLocaleString() + "-",
            top: "0px",
            left: "0px"
        }]);

        setNewPoster({ ...newPoster, name: "", bounty: "", img: "" });
        document.getElementById('imgUpload').value = "";
    };

    const moveImg = (index, dir) => {
        const newPosters = [...posters];
        let p = newPosters[index];
        let t = parseInt(p.top) || 0;
        let l = parseInt(p.left) || 0;

        if (dir === 'up') t -= 10;
        if (dir === 'down') t += 10;
        if (dir === 'left') l -= 10;
        if (dir === 'right') l += 10;

        p.top = t + "px";
        p.left = l + "px";
        setPosters(newPosters);
    };

    const removePoster = (index) => {
        const newPosters = [...posters];
        newPosters.splice(index, 1);
        setPosters(newPosters);
    };

    const clearAll = () => {
        if (confirm("確定要清空所有名單嗎？(這會清除瀏覽器紀錄)")) {
            setPosters([]);
            setBg("");
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            window.dispatchEvent(new Event('storage'));
        }
    };

    const downloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ bg, posters }));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div>
            <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000 }}>
                <Link to="/" className="nav-link" style={{ position: 'static', marginRight: '10px' }}>前往展示區</Link>
            </div>

            <h1 className="page-title">懸賞名單管理後台</h1>

            <div id="poster-container">
                {posters.length === 0 ? "目前名單為空..." :
                    posters.map((p, i) => (
                        <WantedPoster
                            key={i}
                            {...p}
                            onDelete={() => removePoster(i)}
                            onMove={(dir) => moveImg(i, dir)}
                        />
                    ))
                }
            </div>

            <div className="controls">
                <label>🖼️ 網頁大背景圖 (上傳)</label>
                <input type="file" onChange={handleBgUpload} accept="image/*" />

                <label>稱號 / 罪名</label>
                <input
                    type="text"
                    placeholder="例如：最強劍士"
                    value={newPoster.crime}
                    onChange={(e) => setNewPoster({ ...newPoster, crime: e.target.value })}
                />

                <label>對象名稱</label>
                <input
                    type="text"
                    placeholder="例如：名字"
                    value={newPoster.name}
                    onChange={(e) => setNewPoster({ ...newPoster, name: e.target.value })}
                />

                <label>金額</label>
                <input
                    type="number"
                    placeholder="30000000"
                    value={newPoster.bounty}
                    onChange={(e) => setNewPoster({ ...newPoster, bounty: e.target.value })}
                />

                <label>👤 人物照片 (上傳)</label>
                <input type="file" id="imgUpload" accept="image/*" onChange={handleImgUpload} />

                <button className="main-btn" onClick={addPoster}>➕ 新增懸賞令</button>
                <button className="sync-btn" style={{ background: '#555' }} onClick={downloadJson}>⬇️ 下載資料檔 (手動備份)</button>
                <button className="clear-btn" onClick={clearAll}>🗑️ 一鍵清空名單</button>
            </div>
        </div>
    );
};

export default Admin;
