import React from 'react';
import '../css/GameRoom.css';

function GameRoom({ room, currentPlayer }) {
    return (
        <div className="game-room">
            <div className="room-header">
                <div className="room-title">
                    <h2 className="room-name">{room.roomName}</h2>
                    <span className="room-id">#{room.roomId.substring(0, 8)}</span>
                </div>
                <div className="room-info">
                    <span className="player-count">{room.players.length} / {room.maxPlayers} 명</span>
                    <span className="host-name">방장: {room.hostName}</span>
                </div>
            </div>

            <div className="players-container">
                {Array.from({ length: room.maxPlayers }).map((_, index) => {
                    const player = room.players[index];
                    return (
                        <div key={index} className={`player-box ${player ? 'occupied' : 'empty'} ${player?.nickname === currentPlayer ? 'current-player' : ''}`}>
                            {player ? (
                                <>
                                    <div className="player-avatar">
                                        {player.nickname.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="player-info">
                                        <span className="player-nickname">{player.nickname}</span>
                                        <span className="player-status">
                                            {player.isReady ? '준비완료' : '대기중'}
                                        </span>
                                    </div>
                                    {player.nickname === room.hostName && (
                                        <div className="host-badge">👑</div>
                                    )}
                                </>
                            ) : (
                                <div className="empty-slot">
                                    빈 자리
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="room-controls">
                <button className="ready-button">
                    준비하기
                </button>
                <button className="leave-button">
                    나가기
                </button>
            </div>
        </div>
    );
}

export default GameRoom;
