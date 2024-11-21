import React from 'react';
import '../css/GameRoom.css';
import { useLocation } from "react-router-dom";
import { useEffect, useState } from'react';
import { connectWebSocket, sendMessage, setMessageHandler, disconnectWebSocket } from '../websocket/chatService';
import { useNavigate } from "react-router-dom";

function GameRoom() {
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [joinStauts, setJoinStatus] = useState(false);
    const location = useLocation();
    const { roomId,hostStatus,hostName } = location.state || {};

    useEffect(() => {
        let client = null;
        let isSubscribed = true;

        const connectAndSetup = async () => {
            try {
                client = await connectWebSocket();
                console.log("웹소켓 연결 성공");
                
                if (!isSubscribed) return;

                // 메시지 핸들러 설정
                setMessageHandler((response) => {
                    if (!isSubscribed) return;
                    
                    console.log("받은 메시지:", response);
                    switch(response.type) {
                        case 'IS_HOST':
                            console.log("IS_HOST 메시지 수신:", response);
                            if(response.data === 'not Host'){
                                alert('host is not available');
                                navigate(-1);
                            } else {
                                console.log("서버에서 받은 룸 데이터:", response.data);
                                setRoom(response.data);
                            }
                            break;
                        case 'PLAYER_JOINED':
                        case 'PLAYER_LEFT':
                            setRoom(response.data);
                            break;
                        case 'ERROR':
                            alert(response.data.message);
                            break;
                        default:
                            console.log("처리되지 않은 메시지 타입:", response.type);
                            break;
                    }
                });

                if(hostStatus === 'active' && hostName) {
                    console.log("getRoom 메시지 전송 시도:", { roomId, hostName });
                    setJoinStatus(true);
                    await sendMessage('/app/game.getRoom', { roomId, hostName });
                    console.log("getRoom 메시지 전송 완료");
                }
            } catch (error) {
                console.error("웹소켓 연결/메시지 전송 에러:", error);
                if (isSubscribed) {
                    alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
                    navigate(-1);
                }
            }
        };

        connectAndSetup();

        return () => {
            isSubscribed = false;
            if (client) {
                disconnectWebSocket().catch(console.error);
            }
        };
    }, [roomId, hostStatus, hostName, navigate]);

    useEffect(() => {
        console.log("room : ",room);
    }, [room]);


    return (
        <div>
            {!joinStauts ? (
                <div>방 정보를 불러오는 중...</div>
            ) : room ? (
                <div className="game-room">
                    <div className="room-header">
                        <div className="room-title">
                            <h2 className="room-name">{room.roomName}</h2>
                            <span className="room-id">{room.roomId}</span>
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
                                <div key={index} className={`player-box ${player ? 'occupied' : 'empty'}'current-player'`}>
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
            ) : (
                <div>방 정보를 불러오는 중...</div>
            )}
        </div>
    );
}

export default GameRoom;
