import React from 'react';

const WantedPoster = ({
    img,
    crime,
    name,
    bounty,
    top = "0px",
    left = "0px",
    onDelete,
    onMove
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
                            transform: 'scale(1.2)'
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
                </div>
            )}
        </div>
    );
};

export default WantedPoster;
