import React, { useState, useEffect } from "react";
import "./css/LiarMain.css"
import Navigate3 from "../../Navigate3";
import { connectWebSocket, sendMessage, setMessageHandler, disconnectWebSocket } from './websocket/chatService';
import GameRoom from './components/GameRoom';
import { useNavigate } from "react-router-dom";

function LiarMain() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [nickname, setNickname] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [joinNickname, setJoinNickname] = useState('');
    const [client, setClient] = useState(null);
    const [searchHostName, setSearchHostName] = useState('');
    const [hostStatus, setHostStatus] = useState(false);
    const [hostName, setHostName] = useState('');

    useEffect(() => {
        setHostName('');
        return () => {
            if (client) {
                client.deactivate();
            }
        };
       
    }, [client]);

    const initializeWebSocket = () => {
     
            const newClient = connectWebSocket();
            setClient(newClient);
            
            setMessageHandler((response) => {
                switch(response.type) {
                    case 'ROOM_CREATED':
                        setHostStatus(true);
                        setCurrentRoom(response.data);
                        break;
                    case 'PLAYER_JOINED':
                    case 'PLAYER_LEFT':
                        setCurrentRoom(response.data);
                        break;
                    case 'ERROR':
                        alert(response.data.message);
                        break;
                    case 'ROOM_LIST':
                        setRooms(response.data);
                        break;
                    default:
                        break;
                }
            });
        
    };

    const onCreateRoom = () => {
        initializeWebSocket();
        setShowModal(true);
    };

    const handleCreateRoomCancle = () => {
        setShowModal(false);
        if (client) {
            client.deactivate();
            disconnectWebSocket();
            setClient(null);
        }
    }

    const handleJoinCancle = () => {
        setShowJoinModal(false);
        setSelectedRoom(null);
        setJoinNickname('');
        if (client) {
            client.deactivate();
            disconnectWebSocket();
            setClient(null);
        }
    }

   
    // useEffect(() => {
    //     if (showModal) {
    //         initializeWebSocket();
    //     }
    //     else{
    //         if (client) {
    //             client.deactivate();
    //             setClient(null);
    //         }
    //     }
    // }, [showModal]);

    useEffect(() => {
        if (currentRoom) {
            navigate("/liar/room/" + currentRoom.roomId, {
                state: { roomId: currentRoom.roomId, hostStatus: "active" , hostName:hostName},
            });
        }
    }, [currentRoom, navigate]);

    const handleCreateRoom = () => {
        if (!nickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }
        if (!roomName.trim()) {
            alert('방 이름을 입력해주세요.');
            return;
        }

        const roomData = {
            type: 'CREATE_ROOM',
            data: {
                nickname: nickname,
                maxPlayers: maxPlayers,
                roomName: roomName
            }
        };
        
        sendMessage('/app/game.createRoom', roomData);
        setHostName(nickname)
        setShowModal(false);
    };

    const handleJoinClick = () => {
        initializeWebSocket();
        sendMessage('/app/game.getRooms', { type: 'GET_ROOMS' });
        setShowJoinModal(true);
    };

    const handleJoinRoom = () => {
        if (!selectedRoom) {
            alert('방을 선택해주세요.');
            return;
        }
        if (!joinNickname.trim()) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        const joinData = {
            type: 'JOIN_ROOM',
            data: {
                roomId: selectedRoom.roomId,
                nickname: joinNickname
            }
        };

        sendMessage('/app/game.joinRoom', joinData);
        setShowJoinModal(false);
        setSelectedRoom(null);
        setJoinNickname('');
    };

    if (currentRoom) {
        return <GameRoom room={currentRoom} currentPlayer={nickname} />;
    }

    return (
        <div>
            <div className="Navigate-Box">
                <Navigate3 />
            </div>
       
            <div className="Main-Box" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'  }}>
                <div className="room-buttons-container">
                    <h2 className="room-title">채팅방 선택</h2>
                    <div className="room-buttons-wrapper">
                        <button 
                            className="room-button create"
                            onClick={onCreateRoom}
                        >
                            <span className="room-button-content">
                                <span className="room-icon">🏠</span>
                                <span className="room-text">방만들기</span>
                            </span>
                        </button>
                        <button 
                            className="room-button join"
                            onClick={handleJoinClick}
                        >
                            <span className="room-button-content">
                                <span className="room-icon">🚪</span>
                                <span className="room-text">입장하기</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>방 만들기</h2>
                        <input
                            type="text"
                            placeholder="방 이름을 입력하세요"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            className="room-input"
                        />
                        <input
                            type="text"
                            placeholder="닉네임을 입력하세요"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="nickname-input"
                        />
                        <div className="player-count">
                            <label>최대 인원수:</label>
                            <select 
                                value={maxPlayers} 
                                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                            >
                                <option value="4">4명</option>
                                <option value="5">5명</option>
                                <option value="6">6명</option>
                                <option value="7">7명</option>
                                <option value="8">8명</option>
                            </select>
                        </div>
                        <div className="modal-buttons">
                            <button onClick={handleCreateRoom}>생성하기</button>
                            <button onClick={handleCreateRoomCancle}>취소</button>
                        </div>
                    </div>
                </div>
            )}
            {showJoinModal && (
                <div className="modal-overlay">
                    <div className="modal-content join-modal">
                        <h2>방 입장하기</h2>
                        <div className="room-list">
                            <div className="search-container">
                                <div className="search-box">
                                    <input
                                        type="text"
                                        placeholder="방장 닉네임을 입력하세요"
                                        value={searchHostName}
                                        onChange={(e) => setSearchHostName(e.target.value)}
                                        className="search-input"
                                    />
                                    <button 
                                        className="search-button"
                                        onClick={() => {
                                            if (searchHostName.trim()) {
                                                sendMessage('/app/game.getRooms', { 
                                                    type: 'GET_ROOMS',
                                                    data: { hostName: searchHostName.trim() }
                                                });
                                            }
                                        }}
                                    >
                                        <span className="search-icon">🔍</span>
                                        검색
                                    </button>
                                </div>
                                {rooms.length > 0 ? (
                                    <div className="search-results">
                                        {rooms.map(room => (
                                            <div
                                                key={room.roomId}
                                                className={`room-item ${selectedRoom?.roomId === room.roomId ? 'selected' : ''}`}
                                                onClick={() => setSelectedRoom(room)}
                                            >
                                                <div className="room-item-header">
                                                    <span className="room-item-name">{room.roomName}</span>
                                                    <span className="room-item-id">#{room.roomId.substring(0, 8)}</span>
                                                </div>
                                                <div className="room-item-info">
                                                    <span>{room.players.length} / {room.maxPlayers} 명</span>
                                                    <span>방장: {room.hostName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-rooms">
                                        검색된 방이 없습니다
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedRoom && (
                            <input
                                type="text"
                                placeholder="닉네임을 입력하세요"
                                value={joinNickname}
                                onChange={(e) => setJoinNickname(e.target.value)}
                                className="nickname-input"
                            />
                        )}
                        <div className="modal-buttons">
                            <button onClick={handleJoinRoom} disabled={!selectedRoom || !joinNickname.trim()}>
                                입장하기
                            </button>
                            <button onClick={handleJoinCancle}>
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LiarMain;
