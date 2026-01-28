import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WantedPoster from '../components/WantedPoster';

const Admin = () => {
    const [posters, setPosters] = useState([]);
    const [bg, setBg] = useState("");
    const [status, setStatus] = useState("");

    const [newPoster, setNewPoster] = useState({
        crime: "",
        name: "",
        bounty: "",
        img: ""
    });

    const config = {
        token: "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", // Warning: Exposed token
        user: "timcause-bbnet",
        repo: "wanted-list",
        path: "data.json"
    };

    useEffect(() => {
        loadFromGitHub();
    }, []);

    useEffect(() => {
        if (bg) {
            document.body.style.backgroundImage = `url(${bg})`;
        }
    }, [bg]);

    const loadFromGitHub = async () => {
        const url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/${config.path}`;
        try {
            const res = await fetch(url, {
                headers: { "Authorization": `token ${config.token}` }
            });
            if (res.ok) {
                const json = await res.json();
                // Decode: base64 -> escape -> decodeURIComponent -> parse
                const content = JSON.parse(decodeURIComponent(escape(atob(json.content))));
                setPosters(content.posters || []);
                setBg(content.bg || "");
            }
        } catch (e) {
            console.error(e);
            setStatus("尚未有存檔或讀取失敗");
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

        // Reset form mostly
        setNewPoster({ ...newPoster, name: "", bounty: "", img: "" });
        // Reset file input visual
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
        if (confirm("確定要清空所有名單並同步到 GitHub 嗎？")) {
            setPosters([]);
        }
    };

    const syncToGitHub = async () => {
        setStatus("⏳ 正在同步到 GitHub...");
        const url = `https://api.github.com/repos/${config.user}/${config.repo}/contents/${config.path}`;

        try {
            const getRes = await fetch(url + "?t=" + Date.now(), {
                headers: { "Authorization": `token ${config.token}` }
            });

            let sha = "";
            if (getRes.ok) {
                const getJson = await getRes.json();
                sha = getJson.sha;
            }

            // Encode: stringify -> encodeURIComponent -> unescape -> btoa
            const content = btoa(unescape(encodeURIComponent(JSON.stringify({ bg, posters }))));

            const putRes = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${config.token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: "Update Data via Admin",
                    content: content,
                    sha: sha
                })
            });

            if (putRes.ok) {
                setStatus("✅ 同步成功！");
            } else {
                const err = await putRes.json();
                setStatus("❌ 失敗：" + err.message);
            }
        } catch (e) {
            setStatus("❌ 發生錯誤：" + e.message);
        }
    };

    return (
        <div>
            <Link to="/" className="nav-link">前往展示區</Link>

            <h1 className="page-title">懸賞名單管理後台</h1>

            <div id="poster-container">
                {posters.length === 0 ? "目前名單為空或讀取中..." :
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
                <button className="sync-btn" onClick={syncToGitHub}>🚀 同步到 GitHub (發佈)</button>
                <button className="clear-btn" onClick={clearAll}>🗑️ 一鍵清空名單</button>

                <p style={{ textAlign: 'center', fontWeight: 'bold', color: status.includes('失敗') || status.includes('錯誤') ? '#ff4444' : '#27ae60' }}>
                    {status}
                </p>
            </div>
        </div>
    );
};

export default Admin;
