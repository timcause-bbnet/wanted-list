import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import WantedPoster from '../components/WantedPoster';

const Admin = () => {
    // URL Params for Auto-Config
    const [searchParams, setSearchParams] = useSearchParams();

    // Database URL State
    const [dbUrl, setDbUrl] = useState(localStorage.getItem('wanted-list-db-url') || "");
    const [showSettings, setShowSettings] = useState(!dbUrl);

    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");
    const [loading, setLoading] = useState(false);

    const [newPoster, setNewPoster] = useState({
        crime: "",
        name: "",
        bounty: "",
        img: ""
    });

    const [editingIndex, setEditingIndex] = useState(null);

    // 1. Check URL for Auto-Config (?db=ENCODED_URL)
    useEffect(() => {
        const paramDb = searchParams.get('db');
        if (paramDb) {
            try {
                const url = atob(paramDb);
                if (url.includes('firebaseio.com')) {
                    saveDbUrl(url);
                    // Clear param so it looks clean
                    setSearchParams({});
                }
            } catch (e) {
                console.error("Failed to parse db param", e);
            }
        }
    }, [searchParams]);

    // 2. Initial Load if DB URL exists
    useEffect(() => {
        if (dbUrl) {
            loadData();
        }
    }, [dbUrl]);

    // ... (rest of methods)

    const getShareLink = (type) => {
        if (!dbUrl) return "";
        const encoded = btoa(dbUrl);
        const baseUrl = window.location.origin + window.location.pathname;
        const hash = type === 'admin' ? '#/admin' : '#/'; // HashRouter syntax
        return `${baseUrl}${hash}?db=${encoded}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => alert("連結已複製！"));
    };


    const getFirebaseUrl = () => {
        if (!dbUrl) return "";
        let url = dbUrl.trim();
        // Remove trailing slash if user added it
        if (url.endsWith('/')) url = url.slice(0, -1);
        return `${url}/wanted-list.json`;
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const url = getFirebaseUrl();
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setPosters(data.posters || []);
                    setBg(data.bg || "");
                }
            }
        } catch (e) {
            console.error("Failed to load from DB", e);
            alert("讀取失敗：請檢查資料庫網址是否正確");
        } finally {
            setLoading(false);
        }
    };

    // Save to Firebase
    const saveData = async (newPosters, newBg) => {
        if (!dbUrl) {
            alert("請先設定資料庫網址！");
            setShowSettings(true);
            return;
        }

        try {
            // Optimistic update
            setPosters(newPosters);
            setBg(newBg);

            const url = getFirebaseUrl();
            await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ posters: newPosters, bg: newBg })
            });
        } catch (e) {
            console.error("Save failed", e);
            alert("儲存失敗！請檢查網路或網址。");
        }
    };

    const saveDbUrl = (url) => {
        localStorage.setItem('wanted-list-db-url', url);
        setDbUrl(url);
        setShowSettings(false);
        alert("資料庫連結已更新！");
    };

    const handleBgUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const newBg = e.target.result;
                saveData(posters, newBg);
            };
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

        let updatedPosters;
        if (editingIndex !== null) {
            updatedPosters = [...posters];
            // Preserve position if editing
            posterData.top = updatedPosters[editingIndex].top;
            posterData.left = updatedPosters[editingIndex].left;
            updatedPosters[editingIndex] = posterData;
            setEditingIndex(null);
        } else {
            updatedPosters = [...posters, posterData];
        }

        saveData(updatedPosters, bg);
        setNewPoster({ crime: "", name: "", bounty: "", img: "" });
        document.getElementById('imgUpload').value = "";
    };

    const moveImg = (index, dir) => {
        const newPosters = [...posters];
        // Create a deep copy of the item to avoid mutation issues if any
        let p = { ...newPosters[index] };

        let t = parseInt(p.top) || 0;
        let l = parseInt(p.left) || 0;

        if (dir === 'up') t -= 10;
        if (dir === 'down') t += 10;
        if (dir === 'left') l -= 10;
        if (dir === 'right') l += 10;

        p.top = t + "px";
        p.left = l + "px";
        newPosters[index] = p;

        saveData(newPosters, bg);
    };

    const removePoster = (index) => {
        if (confirm("確定要刪除這張懸賞單嗎？")) {
            const newPosters = [...posters];
            newPosters.splice(index, 1);

            if (editingIndex === index) {
                setEditingIndex(null);
                setNewPoster({ crime: "", name: "", bounty: "", img: "" });
            }
            saveData(newPosters, bg);
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
        if (confirm("確定要清空所有名單嗎？(伺服器資料也將被刪除)")) {
            setEditingIndex(null);
            setNewPoster({ crime: "", name: "", bounty: "", img: "" });
            saveData([], "");
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
            <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000, maxWidth: '300px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <Link to="/" className="nav-link" style={{ position: 'static' }}>前往展示區</Link>
                    <button onClick={() => setShowSettings(!showSettings)} style={{
                        background: '#333', color: 'white', border: '1px solid #ffcc33',
                        padding: '10px', borderRadius: '5px', cursor: 'pointer'
                    }}>⚙️ 設定</button>
                </div>

                {showSettings && (
                    <div style={{ background: 'rgba(30, 30, 30, 0.95)', padding: '15px', borderRadius: '10px', border: '1px solid #ffcc33' }}>
                        <label style={{ display: 'block', color: '#ffcc33', marginBottom: '5px', fontWeight: 'bold' }}>
                            🔥 資料庫連結 (Firebase)
                        </label>
                        <input
                            type="text"
                            placeholder="https://your-project.firebaseio.com"
                            defaultValue={dbUrl}
                            onBlur={(e) => saveDbUrl(e.target.value)}
                            style={{ width: '100%', marginBottom: '10px', padding: '5px' }}
                        />
                        <p style={{ fontSize: '12px', color: '#ccc', margin: '0 0 10px 0' }}>
                            請輸入 Firebase Realtime Database 的網址以啟用即時連線。
                        </p>

                        <hr style={{ borderColor: '#555', margin: '10px 0' }} />

                        <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>🖼️ 設定網頁大背景圖</label>
                        <input type="file" onChange={handleBgUpload} accept="image/*" style={{ color: 'white', width: '100%' }} />

                        {dbUrl && (
                            <>
                                <hr style={{ borderColor: '#555', margin: '15px 0' }} />
                                <label style={{ display: 'block', color: '#ffcc33', marginBottom: '8px', fontWeight: 'bold' }}>🔗 產生邀請連結</label>
                                <div style={{ marginBottom: '10px' }}>
                                    <div style={{ color: 'white', fontSize: '12px', marginBottom: '3px' }}>給客人 (展示區):</div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input readOnly value={getShareLink('gallery')} style={{ flex: 1, background: '#222', border: '1px solid #444', color: '#888', fontSize: '11px' }} />
                                        <button onClick={() => copyToClipboard(getShareLink('gallery'))} style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}>複製</button>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'white', fontSize: '12px', marginBottom: '3px' }}>給朋友 (後台):</div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <input readOnly value={getShareLink('admin')} style={{ flex: 1, background: '#222', border: '1px solid #444', color: '#888', fontSize: '11px' }} />
                                        <button onClick={() => copyToClipboard(getShareLink('admin'))} style={{ width: 'auto', padding: '5px 10px', fontSize: '12px' }}>複製</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
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
                <div style={{ borderTop: '1px solid #555', margin: '20px 0', paddingTop: '20px' }}>
                    <h3 style={{ marginTop: 0, color: editingIndex !== null ? '#38bdf8' : 'white' }}>
                        {editingIndex !== null ? '✏️ 編輯懸賞單' : '➕ 新增懸賞單'}
                    </h3>

                    <label>稱號 / 罪名</label>
                    <input
                        type="text"
                        placeholder="例如：惹老闆傷心"
                        value={newPoster.crime}
                        onChange={(e) => setNewPoster({ ...newPoster, crime: e.target.value })}
                    />

                    <label>對象名稱</label>
                    <input
                        type="text"
                        placeholder="例如：3抽就中A的那幾個"
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                        <button className="sync-btn" style={{ background: '#555', marginBottom: 0 }} onClick={downloadJson}>⬇️ 下載備份</button>
                        <label className="sync-btn" style={{ background: '#2c3e50', marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            📂 匯入資料
                            <input type="file" accept=".json" onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    try {
                                        const imported = JSON.parse(ev.target.result);
                                        if (confirm("確定要匯入這份資料嗎？\n目前的資料將會被覆蓋！")) {
                                            if (imported.posters || imported.bg) {
                                                setPosters(imported.posters || []);
                                                setBg(imported.bg || "");
                                                alert("匯入成功！");
                                            } else {
                                                alert("檔案格式錯誤 (找不到 posters 或 bg)");
                                            }
                                        }
                                    } catch (err) {
                                        alert("檔案錯誤：" + err.message);
                                    }
                                    e.target.value = '';
                                };
                                reader.readAsText(file);
                            }} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <button className="clear-btn" onClick={clearAll}>🗑️ 一鍵清空名單</button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
