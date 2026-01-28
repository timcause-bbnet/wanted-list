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

    const [editingIndex, setEditingIndex] = useState(null);

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

        const posterData = {
            ...newPoster,
            name: newPoster.name || "UNKNOWN",
            bounty: "฿ " + Number(newPoster.bounty).toLocaleString() + "-",
            top: "0px",
            left: "0px"
        };

        if (editingIndex !== null) {
            const updatedPosters = [...posters];
            // Preserve position if editing
            posterData.top = updatedPosters[editingIndex].top;
            posterData.left = updatedPosters[editingIndex].left;
            updatedPosters[editingIndex] = posterData;
            setPosters(updatedPosters);
            setEditingIndex(null);
        } else {
            setPosters([...posters, posterData]);
        }

        setNewPoster({ crime: "", name: "", bounty: "", img: "" });
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
        if (confirm("確定要刪除這張懸賞單嗎？")) {
            const newPosters = [...posters];
            newPosters.splice(index, 1);
            setPosters(newPosters);
            if (editingIndex === index) {
                setEditingIndex(null);
                setNewPoster({ crime: "", name: "", bounty: "", img: "" });
            }
        }
    };

    const editPoster = (index) => {
        const p = posters[index];
        // Parse bounty back to number: "฿ 30,000,000-" -> "30000000"
        const bountyNum = p.bounty.replace(/[^\d]/g, '');
        setNewPoster({
            crime: p.crime,
            name: p.name,
            bounty: bountyNum,
            img: p.img
        });
        setEditingIndex(index);
        // Scroll to form
        document.querySelector('.controls').scrollIntoView({ behavior: 'smooth' });
    };

    const printPoster = (index) => {
        const p = posters[index];
        const printWindow = window.open('', '_blank', 'width=800,height=900');

        // Inline styles from index.css needed for the poster
        // Simplified for print view
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Wanted Poster - ${p.name}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@900&display=swap');
                    body { 
                        font-family: 'Noto Sans TC', sans-serif; 
                        display: flex; justify-content: center; align-items: center; 
                        height: 100vh; margin: 0; background: #fff;
                    }
                    .wanted-poster {
                        width: 480px; /* Larger for print */
                        background-color: #dfc9a5; 
                        background-image: url('https://www.transparenttextures.com/patterns/papyros.png');
                        padding: 45px 30px 20px 30px; 
                        color: #3e2723; text-align: center; 
                        border: 2px solid #bc9b6a; position: relative;
                        box-sizing: border-box;
                    }
                    .wanted-header { font-size: 90px; font-family: 'Impact', sans-serif; font-weight: 900; line-height: 0.8; margin-bottom: 20px; transform: scaleY(1.2); }
                    .photo-area { width: 400px; height: 300px; border: 8px solid #3e2723; margin: 0 auto; overflow: hidden; position: relative; background: #ddd; }
                    .photo-area img { width: 100%; height: 100%; object-fit: cover; position: absolute; }
                    .dead-or-alive { font-size: 30px; font-family: 'Impact', sans-serif; margin: 15px 0; display: flex; align-items: center; justify-content: space-between; border-top: 2px solid #3e2723; border-bottom: 2px solid #3e2723; padding: 5px 0; }
                    .dead-or-alive::before, .dead-or-alive::after { content: "๑"; font-size: 35px; }
                    .crime-display { font-size: 24px; font-weight: bold; margin-bottom: 20px; min-height: 30px; line-height: 1.2; }
                    .name-display { font-size: 50px; font-family: 'Impact', sans-serif; text-transform: uppercase; line-height: 1; min-height: 60px; }
                    .bounty-display { font-size: 35px; font-family: 'Impact', sans-serif; margin-top: 10px; font-weight: bold; }
                    .bottom-decoration { font-size: 12px; text-align: left; line-height: 1; margin-top: 10px; opacity: 0.8; width: 70%; float: left; white-space: normal; }
                    .marine-footer { font-size: 40px; font-family: 'Impact', sans-serif; text-align: right; margin-top: -10px; }
                    @media print {
                        body { background: none; }
                        .wanted-poster { box-shadow: none; border: 1px solid #000; }
                    }
                </style>
            </head>
            <body>
                <div class="wanted-poster">
                    <div class="wanted-header">WANTED</div>
                    <div class="photo-area">
                        <img src="${p.img}" style="top:${p.top}; left:${p.left}; transform:scale(1.2);">
                    </div>
                    <div class="dead-or-alive">DEAD OR ALIVE</div>
                    <div class="crime-display">${p.crime}</div>
                    <div class="name-display">${p.name}</div>
                    <div class="bounty-display">${p.bounty}</div>
                    <div class="bottom-decoration">
                        KONO SAKUHIN WA FICTION DETHUNODE JITSUSAINO J人物 BUTSU DAITAI SONOTA NO SOSHIKI TO DOITSU NO MEISHOU GA GEKICHU NI TOUJO SHITEMO JITSUSAINO MONO TO WA ISSAI MUKANKEIDETHU.
                    </div>
                    <div class="marine-footer">MARINE</div>
                    <div style="clear: both;"></div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const clearAll = () => {
        if (confirm("確定要清空所有名單嗎？(這會清除瀏覽器紀錄)")) {
            setPosters([]);
            setBg("");
            setNewPoster({ crime: "", name: "", bounty: "", img: "" });
            setEditingIndex(null);
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

    const cancelEdit = () => {
        setEditingIndex(null);
        setNewPoster({ crime: "", name: "", bounty: "", img: "" });
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
                            onEdit={() => editPoster(i)}
                            onPrint={() => printPoster(i)}
                        />
                    ))
                }
            </div>

            <div className="controls">
                <label>🖼️ 網頁大背景圖 (上傳)</label>
                <input type="file" onChange={handleBgUpload} accept="image/*" />

                <div style={{ borderTop: '1px solid #555', margin: '20px 0', paddingTop: '20px' }}>
                    <h3 style={{ marginTop: 0, color: editingIndex !== null ? '#38bdf8' : 'white' }}>
                        {editingIndex !== null ? '✏️ 編輯懸賞單' : '➕ 新增懸賞單'}
                    </h3>

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

                    <label>👤 人物照片 {editingIndex !== null ? '(不重新上傳則維持原圖)' : '(上傳)'}</label>
                    <input type="file" id="imgUpload" accept="image/*" onChange={handleImgUpload} />

                    <button className="main-btn" onClick={addPoster} style={{ background: editingIndex !== null ? '#38bdf8' : '#e67e22' }}>
                        {editingIndex !== null ? '💾 儲存修改' : '➕ 新增懸賞令'}
                    </button>

                    {editingIndex !== null && (
                        <button className="clear-btn" style={{ marginTop: '10px', background: '#777' }} onClick={cancelEdit}>
                            ❌ 取消編輯 (不儲存)
                        </button>
                    )}
                </div>

                <div style={{ marginTop: '30px', borderTop: '1px solid #555', paddingTop: '20px' }}>
                    <button className="sync-btn" style={{ background: '#555' }} onClick={downloadJson}>⬇️ 下載資料檔 (手動備份)</button>
                    <button className="clear-btn" onClick={clearAll}>🗑️ 一鍵清空名單</button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
