import React from 'react';

const WantedPoster = ({
    img,
    crime,
    name,
    bounty,
    top = "0px",
    left = "0px",
    onDelete,
    onMove,
    onEdit,
    onPrint
}) => {
    return (
        <div className={onDelete ? "poster-wrapper" : ""}>
            {onDelete && (
                <div className="delete-btn" onClick={onDelete}>X</div>
            )}

            <div className="wanted-poster">
                <div className="wanted-header">WANTED</div>
                <div className="photo-area">
                    <img
                        src={img}
                        alt={name}
                        style={{
                            top: top,
                            left: left,
                            width: '100%',
                            height: '100%',
                            objectFit: 'scale-down'
                        }}
                    />
                </div>
                <div className="dead-or-alive">DEAD OR ALIVE</div>
                <div className="crime-display">{crime}</div>
                <div className="name-display">{name}</div>
                <div className="bounty-display">{bounty}</div>
                <div className="bottom-decoration">
                    KONO SAKUHIN WA FICTION DETHUNODE JITSUSAINO J人物 BUTSU DAITAI SONOTA NO SOSHIKI TO DOITSU NO MEISHOU GA GEKICHU NI TOUJO SHITEMO JITSUSAINO MONO TO WA ISSAI MUKANKEIDETHU.
                </div>
                <div className="marine-footer">MARINE</div>
                <div style={{ clear: 'both' }}></div>
            </div>

            {onMove && (
                <div className="move-controls">
                    <button className="btn-move" onClick={() => onMove('up')}>↑</button><br />
                    <button className="btn-move" onClick={() => onMove('left')}>←</button>
                    <button className="btn-move" onClick={() => onMove('down')}>↓</button>
                    <button className="btn-move" onClick={() => onMove('right')}>→</button>

                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                style={{
                                    background: '#38bdf8', color: '#fff', border: 'none',
                                    padding: '5px 10px', borderRadius: '4px', cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ✏️ 修改
                            </button>
                        )}
                        {onPrint && (
                            <button
                                onClick={onPrint}
                                style={{
                                    background: '#a855f7', color: '#fff', border: 'none',
                                    padding: '5px 10px', borderRadius: '4px', cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                🖨️ 列印
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WantedPoster;
